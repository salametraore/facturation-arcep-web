import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LocalPageDataSource } from '../../../rcv/local-page-datasource';
import { RcvDeclencheursApi } from '../../../rcv/endpoints/rcv-declencheurs.api';

import {
  RecouvDeclencheurEditDialogComponent,
  RcvDeclencheurEditDialogData
} from './recouv-declencheur-edit-dialog.component';

import {
  criteresToDelai,
  RcvDeclencheur,
  RcvDeclencheurCriteres,
  RcvTypeDelai
} from '../../models/rcv-declencheur.models';

import { RecouvGroupeServices } from '../../../shared/services/recouv-groupe.services';
import { RecouvGroupe } from '../../../shared/models/recouv-groupe';
import {AuthzService} from "../../../authentication/authz.service";

@Component({
  selector: 'recouv-declencheurs',
  templateUrl: './recouv-declencheurs.component.html',
  styleUrls: ['./recouv-declencheurs.component.scss']
})
export class RecouvDeclencheursComponent implements OnInit, AfterViewInit {
  displayedColumns = ['nom', 'groupe', 'criteres', 'description', 'actif', 'actions'];

  dataSource: LocalPageDataSource<RcvDeclencheur> | null = null;

  total$: Observable<number> = of(0);
  loading$: Observable<boolean> = of(false);

  search = '';

  groupes: RecouvGroupe[] = [];
  groupesLoading = false;
  groupesError = '';

  groupeLabelById: Record<number, string> = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actif: boolean | null = null;
  groupeId: number | null = null;
  typeDelai: RcvTypeDelai | null = null;

  constructor(
    private api: RcvDeclencheursApi,
    private recouvGroupeServices: RecouvGroupeServices,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private authzService: AuthzService,
  ) {}

  ngOnInit(): void {
    this.loadGroupes();
  }

  hasOperationCode(opCode: string): boolean {
    return !!opCode && this.authzService.has(opCode);
  }

  hasAnyOperationCode(codes: string[]): boolean {
    return codes.some(code => this.authzService.has(code));
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const ds = new LocalPageDataSource<RcvDeclencheur>(
        this.paginator,
        this.sort,
        (q) => this.api.list(q)
      );

      this.dataSource = ds;
      this.total$ = ds.totalCount$();
      this.loading$ = ds.loadingState$();

      this.sort.active = 'nom';
      this.sort.direction = 'asc';

      this.applyFilters();
      this.applySearch();

      this.cdr.detectChanges();
    });
  }

  private loadGroupes(): void {
    this.groupesLoading = true;
    this.groupesError = '';

    this.recouvGroupeServices.getItems()
      .pipe(finalize(() => (this.groupesLoading = false)))
      .subscribe({
        next: (items: any) => {
          const rows: RecouvGroupe[] = Array.isArray(items) ? items : (items?.results ?? []);

          this.groupes = rows;

          this.groupeLabelById = this.groupes.reduce((acc, g) => {
            if (g?.id != null) {
              acc[g.id] = g.nom || `Groupe #${g.id}`;
            }
            return acc;
          }, {} as Record<number, string>);
        },
        error: (err) => {
          console.error('Erreur chargement groupes recouvrement', err);
          this.groupes = [];
          this.groupeLabelById = {};
          this.groupesError = 'Impossible de charger les groupes';
        }
      });
  }

  applyFilters(): void {
    if (!this.dataSource) return;

    const filters: Record<string, any> = {
      actif: this.actif === null ? null : this.actif,
      groupe_id: this.groupeId === null ? null : this.groupeId
    };

    if (this.typeDelai === 'AVANT') {
      filters['criteres.jours_avant_echeance_min'] = 'NOT_NULL';
    }

    if (this.typeDelai === 'APRES') {
      filters['criteres.jours_apres_echeance_min'] = 'NOT_NULL';
    }

    this.dataSource.setFilters(filters);
  }

  clear(): void {
    this.search = '';
    this.actif = null;
    this.groupeId = null;
    this.typeDelai = null;

    if (!this.dataSource) return;

    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  applySearch(): void {
    if (!this.dataSource) return;
    this.dataSource.setSearch(this.search);
  }

  criteresChipsShort(c: RcvDeclencheurCriteres): string[] {
    const chips: string[] = [];
    if (!c) return chips;

    if (c.type_client?.length) chips.push(`Clients: ${c.type_client.length}`);
    if (c.produit_code?.length) chips.push(`Produits: ${c.produit_code.length}`);

    const min = c.montant_min;
    const max = c.montant_max;

    if (min != null && max != null) chips.push(`Montant: ${this.fmt(min)}–${this.fmt(max)}`);
    else if (min != null) chips.push(`Montant ≥ ${this.fmt(min)}`);
    else if (max != null) chips.push(`Montant ≤ ${this.fmt(max)}`);

    if (c.nb_factures_impayees_min != null) {
      chips.push(`Impayés ≥ ${c.nb_factures_impayees_min}`);
    }

    const d = criteresToDelai(c);
    if (d.nbJours >= 0) {
      chips.push(`${d.typeDelai === 'AVANT' ? 'Avant' : 'Après'} +${d.nbJours}j`);
    }

    return chips;
  }

  criteresTooltip(c: RcvDeclencheurCriteres): string {
    if (!c) return 'Aucun critère';

    const lines: string[] = [];

    if (c.type_client?.length) lines.push(`Type client: ${c.type_client.join(', ')}`);
    if (c.produit_code?.length) lines.push(`Produit/service: ${c.produit_code.join(', ')}`);

    const min = c.montant_min;
    const max = c.montant_max;

    if (min != null && max != null) lines.push(`Montant: ${this.fmt(min)} à ${this.fmt(max)}`);
    else if (min != null) lines.push(`Montant min: ${this.fmt(min)}`);
    else if (max != null) lines.push(`Montant max: ${this.fmt(max)}`);

    if (c.nb_factures_impayees_min != null) {
      lines.push(`Nb factures impayées (min): ${c.nb_factures_impayees_min}`);
    }

    const d = criteresToDelai(c);
    if (d.nbJours >= 0) {
      lines.push(`Délai: ${d.typeDelai === 'AVANT' ? 'Avant échéance' : 'Après échéance'} + ${d.nbJours} jours`);
    } else {
      lines.push('Délai: non défini');
    }

    return lines.join('\n');
  }

  private fmt(n: number): string {
    return Number(n).toLocaleString('fr-FR');
  }

  groupeLabel(id: number | null | undefined): string {
    if (id == null) return '-';
    return this.groupeLabelById[id] ?? `Groupe #${id}`;
  }

  onAdd(): void {
    const data: RcvDeclencheurEditDialogData = { mode: 'create' };
    const ref = this.dialog.open(RecouvDeclencheurEditDialogComponent, {
      width: '900px',
      maxWidth: '98vw',
      data
    });

    ref.afterClosed().subscribe(changed => {
      if (changed) this.refresh();
    });
  }

  onEdit(row: RcvDeclencheur): void {
    const data: RcvDeclencheurEditDialogData = { mode: 'edit', row };
    const ref = this.dialog.open(RecouvDeclencheurEditDialogComponent, {
      width: '900px',
      maxWidth: '98vw',
      data
    });

    ref.afterClosed().subscribe(changed => {
      if (changed) this.refresh();
    });
  }

  onDelete(row: RcvDeclencheur): void {
    const yes = confirm(`Supprimer le déclencheur "${row.nom}" ?`);
    if (!yes) return;

    this.api.delete(row.id).subscribe({
      next: () => this.refresh(),
      error: () => alert('Suppression impossible')
    });
  }

  private refresh(): void {
    this.api.reload();

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.loadGroupes();

    queueMicrotask(() => {
      this.applyFilters();
      this.applySearch();
      this.cdr.detectChanges();
    });
  }

  trackById(_: number, r: RcvDeclencheur): number {
    return r.id;
  }

  trackByGroupeId(_: number, g: RecouvGroupe): number {
    return g.id;
  }

  delete(row: any) {

  }

  openEdit(row: any) {

  }
}
