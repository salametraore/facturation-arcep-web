import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable, of} from 'rxjs';
import {LocalPageDataSource} from '../../../rcv/local-page-datasource';
import {PageResult} from '../../../rcv/rcv-query';

import {RcvDeclencheursApi} from '../../../rcv/endpoints/rcv-declencheurs.api';

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

@Component({
  selector: 'recouv-declencheurs',
  templateUrl: './recouv-declencheurs.component.html',
  styleUrls: ['./recouv-declencheurs.component.scss']
})
export class RecouvDeclencheursComponent implements AfterViewInit {
  displayedColumns = ['nom', 'groupe', 'criteres', 'description', 'actif', 'actions'];

  dataSource!: LocalPageDataSource<RcvDeclencheur>;

  total$: Observable<number> = of(0);
  loading$: Observable<boolean> = of(false);

  search = '';

  // TODO: remplacer par un vrai service groupes (RcvGroupesApi) si tu veux afficher le libellé réel
  groupeLabelById: Record<number, string> = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  actif: boolean | null = null;
  groupeId: number | null = null;
  typeDelai: RcvTypeDelai | null = null; // 'AVANT' | 'APRES'


  constructor(
    private api: RcvDeclencheursApi,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.dataSource = new LocalPageDataSource<RcvDeclencheur>(
      this.paginator,
      this.sort,
      (q) => this.api.list(q) as PageResult<RcvDeclencheur>
    );

    this.total$ = this.dataSource.totalCount$();
    this.loading$ = this.dataSource.loadingState$();

    // Optionnel: tri par défaut
    this.sort.active = 'nom';
    this.sort.direction = 'asc';

    this.applyFilters();
    this.applySearch();
  }

  applyFilters() {
  /*    this.dataSource.setFilters({
        actif: this.actif === null ? null : this.actif,
        groupe_id: this.groupeId === null ? null : this.groupeId,
      });*/


    const filters: any = {
      actif: this.actif === null ? null : this.actif,
      groupe_id: this.groupeId === null ? null : this.groupeId,
    };

    if (this.typeDelai === 'AVANT') filters['criteres.jours_avant_echeance_min'] = 'NOT_NULL';
    if (this.typeDelai === 'APRES') filters['criteres.jours_apres_echeance_min'] = 'NOT_NULL';

    this.dataSource.setFilters(filters);

  }

  clear() {
    this.search = '';
    this.actif = null;
    this.groupeId = null;
    this.typeDelai = null;

    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  private refresh() {
    this.applyFilters();
    this.applySearch();
  }


  applySearch() {
    this.dataSource.setSearch(this.search);
  }



  criteresChipsShort(c: RcvDeclencheurCriteres): string[] {
    const chips: string[] = [];
    if (!c) return chips;

    // Clients
    if (c.type_client?.length) chips.push(`Clients: ${c.type_client.length}`);

    // Produits
    if (c.produit_code?.length) chips.push(`Produits: ${c.produit_code.length}`);

    // Montant
    const min = c.montant_min;
    const max = c.montant_max;
    if (min != null && max != null) chips.push(`Montant: ${this.fmt(min)}–${this.fmt(max)}`);
    else if (min != null) chips.push(`Montant ≥ ${this.fmt(min)}`);
    else if (max != null) chips.push(`Montant ≤ ${this.fmt(max)}`);

    // Impayés
    if (c.nb_factures_impayees_min != null) chips.push(`Impayés ≥ ${c.nb_factures_impayees_min}`);

    // Délai
    const d = criteresToDelai(c);
    if (d.nbJours > 0) chips.push(`${d.typeDelai === 'AVANT' ? 'Avant' : 'Après'} +${d.nbJours}j`);

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

    if (c.nb_factures_impayees_min != null) lines.push(`Nb factures impayées (min): ${c.nb_factures_impayees_min}`);

    const d = criteresToDelai(c);
    if (d.nbJours > 0) lines.push(`Délai: ${d.typeDelai === 'AVANT' ? 'Avant échéance' : 'Après échéance'} + ${d.nbJours} jours`);
    else lines.push(`Délai: non défini`);

    return lines.join('\n');
  }

  private fmt(n: number): string {
    return Number(n).toLocaleString('fr-FR'); // ex: 100000 -> 100 000
  }

  groupeLabel(id: number): string {
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

    this.api.delete(row.id);
    this.refresh();
  }


  trackById(_: number, r: RcvDeclencheur) {
    return r.id;
  }

}
