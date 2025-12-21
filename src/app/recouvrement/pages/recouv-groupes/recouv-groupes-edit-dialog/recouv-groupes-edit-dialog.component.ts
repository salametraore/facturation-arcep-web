import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LocalPageDataSource } from '../../../../rcv/local-page-datasource';
import { RcvGroupesApi } from '../../../../rcv/endpoints/rcv-groupes.api';
import { RcvStoreService } from '../../../../rcv/rcv-store.service';
import {RecouvGroupesDynFacturesDialogComponent} from "../recouv-groupes-dyn-factures-dialog/recouv-groupes-dyn-factures-dialog.component";

type GroupeType = 'MANUEL' | 'DYNAMIQUE';

type DialogData =
  | { mode: 'create' }
  | { mode: 'edit'; groupeId: number };

function isEditData(d: DialogData): d is { mode: 'edit'; groupeId: number } {
  return d.mode === 'edit';
}

@Component({
  selector: 'recouv-groupes-edit-dialog',
  templateUrl: './recouv-groupes-edit-dialog.component.html',
  styleUrls: ['./recouv-groupes-edit-dialog.component.scss']
})
export class RecouvGroupesEditDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  // ---- Membres manuels ----
  membresDisplayed = ['client', 'type_client', 'exclu', 'motif', 'actions'];
  membresDataSource?: LocalPageDataSource<any>;
  membresSearch = '';
  excluFilter: boolean | null = null;

  // ajout membre
  clientSearch = '';
  clientOptions: any[] = [];
  selectedClientId?: number;

  // ---- Preview dynamique ----
  dynDisplayed = ['client', 'type_client', 'nb_factures', 'montant_total', 'actions'];
  dynDataSource?: LocalPageDataSource<any>;
  dynSearch = '';

  isEdit = false;
  groupeId?: number;

  @ViewChild('membresPaginator') membresPaginator?: MatPaginator;
  @ViewChild('membresSort') membresSort?: MatSort;

  @ViewChild('dynPaginator') dynPaginator?: MatPaginator;
  @ViewChild('dynSort') dynSort?: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<RecouvGroupesEditDialogComponent>,
    private fb: FormBuilder,
    private groupesApi: RcvGroupesApi,
    private store: RcvStoreService,
    private dialog: MatDialog
  ) {}



  get typeGroupe(): GroupeType {
    return (this.form?.get('type_groupe')?.value ?? 'DYNAMIQUE') as GroupeType;
  }
  get isManuel(): boolean { return this.typeGroupe === 'MANUEL'; }
  get isDynamique(): boolean { return this.typeGroupe === 'DYNAMIQUE'; }

  ngOnInit(): void {
    if (isEditData(this.data)) {
      this.isEdit = true;
      this.groupeId = this.data.groupeId;

      const g = this.groupesApi.get(this.groupeId);

      this.form = this.fb.group({
        code: [g?.code ?? '', [Validators.required, Validators.maxLength(50)]],
        nom: [g?.nom ?? '', [Validators.required, Validators.maxLength(255)]],
        description: [g?.description ?? '', [Validators.maxLength(500)]],
        priority: [g?.priority ?? 10, [Validators.required]],
        actif: [g?.actif ?? true],
        type_groupe: [ (g?.type_groupe ?? 'DYNAMIQUE') as GroupeType, [Validators.required] ]
      });

      // si on change le type -> on “reset” les onglets / datasources
      this.form.get('type_groupe')!.valueChanges.subscribe(() => {
        this.membresDataSource = undefined;
        this.dynDataSource = undefined;
      });

      return;
    }

    // create
    this.isEdit = false;
    this.groupeId = undefined;

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(500)]],
      priority: [10, [Validators.required]],
      actif: [true],
      type_groupe: ['DYNAMIQUE' as GroupeType, [Validators.required]]
    });
  }

  // appelé quand on change d’onglet
  onTabChange(): void {
    if (!this.isEdit || !this.groupeId) return;

    // init membres manuels
    if (this.isManuel && this.membresPaginator && this.membresSort && !this.membresDataSource) {
      this.membresDataSource = new LocalPageDataSource<any>(
        this.membresPaginator,
        this.membresSort,
        (q) => this.groupesApi.listMembres(this.groupeId!, q)
      );
      this.membresSort.active = 'id';
      this.membresSort.direction = 'desc';
    }

    // init preview dynamique
    if (this.isDynamique && this.dynPaginator && this.dynSort && !this.dynDataSource) {
      this.dynDataSource = new LocalPageDataSource<any>(
        this.dynPaginator,
        this.dynSort,
        (q) => this.groupesApi.previewDynMembers(this.groupeId!, q)
      );
      this.dynSort.active = 'montant_total';
      this.dynSort.direction = 'desc';
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.value;

    if (this.isEdit && this.groupeId) {
      this.groupesApi.update(this.groupeId, dto);
      this.ref.close(true);
      return;
    }

    this.groupesApi.create(dto);
    this.ref.close(true);
  }

  close(): void {
    this.ref.close(false);
  }

  // -------- Membres manuels --------
  applyMembresSearch(): void {
    this.membresDataSource?.setSearch(this.membresSearch);
  }

  applyMembresFilters(): void {
    this.membresDataSource?.setFilters({
      exclu: this.excluFilter === null ? null : this.excluFilter
    });
  }

  clearMembresFilters(): void {
    this.membresSearch = '';
    this.excluFilter = null;
    this.membresDataSource?.setSearch('');
    this.membresDataSource?.setFilters({});
  }

  refreshClientOptions(): void {
    const all = this.store.list<any>('clients');
    const s = this.clientSearch.trim().toLowerCase();

    this.clientOptions = all
      .filter(c =>
        !s ||
        String(c.code).toLowerCase().includes(s) ||
        String(c.denomination).toLowerCase().includes(s)
      )
      .slice(0, 20);
  }

  addMembre(): void {
    if (!this.groupeId) return;
    if (!this.selectedClientId) return;
    if (!this.isManuel) return; // sécurité

    this.groupesApi.addMembre(this.groupeId, this.selectedClientId);
    this.selectedClientId = undefined;
    this.clientSearch = '';
    this.clientOptions = [];
    this.membresDataSource?.setFilters({ exclu: this.excluFilter });
  }

  toggleExclu(m: any): void {
    const exclu = !m.exclu;
    const motif = exclu ? prompt('Motif exclusion (optionnel) :', m.motif_override ?? '') ?? undefined : undefined;
    this.groupesApi.toggleExclu(m.id, exclu, motif);
    this.membresDataSource?.setFilters({ exclu: this.excluFilter });
  }

  removeMembre(m: any): void {
    const ok = confirm(`Retirer ${m.client?.denomination} du groupe ?`);
    if (!ok) return;
    this.groupesApi.removeMembre(m.id);
    this.membresDataSource?.setFilters({ exclu: this.excluFilter });
  }

  // -------- Preview dynamique --------
  applyDynSearch(): void {
    this.dynDataSource?.setSearch(this.dynSearch);
  }

  openDynFactures(row: any): void {
    if (!this.groupeId) return;
    this.dialog.open(RecouvGroupesDynFacturesDialogComponent, {
      width: '1100px',
      maxWidth: '98vw',
      data: { groupeId: this.groupeId, client: row.client }
    });
  }
}
