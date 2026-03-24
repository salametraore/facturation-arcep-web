import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Observable, from, isObservable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LocalPageDataSource } from '../../../../rcv/local-page-datasource';
import { RcvGroupesApi } from '../../../../rcv/endpoints/rcv-groupes.api';
import { RecouvGroupesDynFacturesDialogComponent } from '../recouv-groupes-dyn-factures-dialog/recouv-groupes-dyn-factures-dialog.component';

import { Client } from '../../../../shared/models/client';
import { ClientService } from '../../../../shared/services/client.service';

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
export class RecouvGroupesEditDialogComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  loading = false;

  // ---- Membres manuels ----
  membresDisplayed = ['client', 'type_client', 'exclu', 'motif', 'actions'];
  membresDataSource?: LocalPageDataSource<any>;
  membresSearch = '';
  excluFilter: boolean | null = null;

  // ---- Ajout membre manuel ----
  clientSearch = '';
  clientOptions: Client[] = [];
  selectedClientId?: number;

  // ---- Preview dynamique ----
  dynDisplayed = ['client', 'type_client', 'nb_factures', 'montant_total', 'actions'];
  dynDataSource?: LocalPageDataSource<any>;
  dynSearch = '';

  isEdit = false;
  groupeId?: number;

  clients: Client[] = [];

  private _membresPaginator?: MatPaginator;
  private _membresSort?: MatSort;
  private _dynPaginator?: MatPaginator;
  private _dynSort?: MatSort;

  @ViewChild('membresPaginator')
  set membresPaginatorRef(value: MatPaginator | undefined) {
    this._membresPaginator = value;
    this.tryInitMembres();
  }

  @ViewChild('membresSort')
  set membresSortRef(value: MatSort | undefined) {
    this._membresSort = value;
    this.tryInitMembres();
  }

  @ViewChild('dynPaginator')
  set dynPaginatorRef(value: MatPaginator | undefined) {
    this._dynPaginator = value;
    this.tryInitDyn();
  }

  @ViewChild('dynSort')
  set dynSortRef(value: MatSort | undefined) {
    this._dynSort = value;
    this.tryInitDyn();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<RecouvGroupesEditDialogComponent>,
    private fb: FormBuilder,
    private groupesApi: RcvGroupesApi,
    private dialog: MatDialog,
    private clientService: ClientService,
  ) {}

  get typeGroupe(): GroupeType {
    return (this.form?.get('type_groupe')?.value ?? 'DYNAMIQUE') as GroupeType;
  }

  get isManuel(): boolean {
    return this.typeGroupe === 'MANUEL';
  }

  get isDynamique(): boolean {
    return this.typeGroupe === 'DYNAMIQUE';
  }

  ngOnInit(): void {
    this.initForm();
    this.loadClients();

    this.form.get('type_groupe')!.valueChanges.subscribe(() => {
      this.membresDataSource = undefined;
      this.dynDataSource = undefined;
      this.selectedClientId = undefined;
      this.clientSearch = '';
      this.clientOptions = this.clients.slice(0, 20);

      queueMicrotask(() => {
        this.tryInitMembres(true);
        this.tryInitDyn(true);
      });
    });

    if (!isEditData(this.data)) {
      this.isEdit = false;
      this.groupeId = undefined;
      return;
    }

    this.isEdit = true;
    this.groupeId = this.data.groupeId;
    this.loadGroupe();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.tryInitMembres();
      this.tryInitDyn();
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(500)]],
      priority: [10, [Validators.required]],
      actif: [true],
      type_groupe: ['DYNAMIQUE' as GroupeType, [Validators.required]]
    });
  }

  private loadClients(): void {
    this.clientService.getItems().subscribe({
      next: (clients: Client[]) => {
        this.clients = Array.isArray(clients) ? clients : [];
        this.clientOptions = this.clients.slice(0, 20);
      },
      error: (err) => {
        console.error('Chargement des clients impossible', err);
        this.clients = [];
        this.clientOptions = [];
      }
    });
  }

  private loadGroupe(): void {
    if (!this.groupeId) return;

    this.loading = true;

    const raw: any = this.groupesApi.get(this.groupeId);
    const g$: Observable<any> = isObservable(raw) ? raw : (raw?.then ? from(raw) : of(raw));

    g$.subscribe({
      next: (g: any) => {
        this.form.patchValue({
          code: g?.code ?? '',
          nom: g?.nom ?? '',
          description: g?.description ?? '',
          priority: g?.priority ?? 10,
          actif: g?.actif ?? true,
          type_groupe: (g?.type_groupe ?? 'DYNAMIQUE') as GroupeType
        });

        queueMicrotask(() => {
          this.tryInitMembres(true);
          this.tryInitDyn(true);
        });
      },
      error: (err) => {
        console.error(err);
        alert('Chargement groupe impossible');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private tryInitMembres(force = false): void {
    if (!this.isEdit || !this.groupeId || !this.isManuel) return;
    if (!this._membresPaginator || !this._membresSort) return;
    if (this.membresDataSource && !force) return;

    this.membresDataSource = new LocalPageDataSource<any>(
      this._membresPaginator,
      this._membresSort,
      (q) => this.groupesApi.listMembres(this.groupeId!, q)
    );

    this._membresSort.active = 'id';
    this._membresSort.direction = 'desc';

    this.membresDataSource.setSearch(this.membresSearch ?? '');
    this.membresDataSource.setFilters({
      exclu: this.excluFilter === null ? null : this.excluFilter
    });
  }

  private tryInitDyn(force = false): void {
    if (!this.isEdit || !this.groupeId || !this.isDynamique) return;
    if (!this._dynPaginator || !this._dynSort) return;
    if (this.dynDataSource && !force) return;

    this.dynDataSource = new LocalPageDataSource<any>(
      this._dynPaginator,
      this._dynSort,
      (q) => this.groupesApi.previewDynMembers(this.groupeId!, q)
    );

    this._dynSort.active = 'montant_total';
    this._dynSort.direction = 'desc';

    this.dynDataSource.setSearch(this.dynSearch ?? '');
  }

  onTabChange(): void {
    queueMicrotask(() => {
      this.tryInitMembres();
      this.tryInitDyn();
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.value;
    this.loading = true;

    const req: any = (this.isEdit && this.groupeId)
      ? this.groupesApi.update(this.groupeId, dto)
      : this.groupesApi.create(dto);

    if (!req || typeof req.subscribe !== 'function') {
      this.loading = false;
      console.error('create/update returned null/undefined (or not Observable).', {
        isEdit: this.isEdit,
        groupeId: this.groupeId,
        returned: req
      });
      alert("Erreur technique: l'appel d'enregistrement n'a pas retourné de requête.");
      return;
    }

    req.pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => this.ref.close(true),
      error: (e: any) => {
        console.error(e);
        alert('Enregistrement impossible');
      }
    });
  }

  close(): void {
    this.ref.close(false);
  }

  // -------------------------------------------------
  // Gestion des clients depuis la base de données
  // -------------------------------------------------
  refreshClientOptions(): void {
    const s = this.clientSearch.trim().toLowerCase();

    this.clientOptions = this.clients
      .filter((c: any) => {
        const code = String(c?.code ?? '').toLowerCase();
        const denomination = String(c?.denomination_sociale ?? c?.denomination ?? '').toLowerCase();
        const compte = String(c?.compte_comptable ?? '').toLowerCase();
        const ifu = String(c?.ifu ?? '').toLowerCase();
        const email = String(c?.email ?? '').toLowerCase();

        return !s ||
          code.includes(s) ||
          denomination.includes(s) ||
          compte.includes(s) ||
          ifu.includes(s) ||
          email.includes(s);
      })
      .slice(0, 20);
  }

  private resolveClient(source: any): any {
    if (!source) return null;

    if (source?.client && typeof source.client === 'object') {
      return source.client;
    }

    const clientId = source?.client_id ?? source?.client ?? source?.id;
    if (!clientId) return null;

    return this.clients.find((c: any) => Number(c.id) === Number(clientId)) ?? null;
  }

  getClientName(source: any): string {
    const c = this.resolveClient(source) ?? source;
    return c?.denomination_sociale ?? c?.denomination ?? c?.nom ?? '-';
  }

  getClientReference(source: any): string {
    const c = this.resolveClient(source) ?? source;
    return c?.compte_comptable ?? c?.ifu ?? c?.code ?? (source?.client_id ? `ID ${source.client_id}` : '-');
  }

  getClientEmail(source: any): string {
    const c = this.resolveClient(source) ?? source;
    return c?.email ?? '-';
  }

  getClientType(source: any): string {
    const c = this.resolveClient(source) ?? source;
    return c?.type_client ?? c?.type ?? '-';
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

  addMembre(): void {
    if (!this.groupeId || !this.selectedClientId || !this.isManuel) return;

    const clientId = Number(this.selectedClientId);
    this.loading = true;

    this.groupesApi.addMembre(this.groupeId, clientId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          console.log('Ajout membre OK', res);

          this.selectedClientId = undefined;
          this.clientSearch = '';
          this.clientOptions = this.clients.slice(0, 20);

          this._membresPaginator?.firstPage();

          queueMicrotask(() => this.tryInitMembres(true));
        },
        error: (err) => {
          console.error('Ajout membre impossible', err);
          alert('Ajout membre impossible');
        }
      });
  }

  toggleExclu(m: any): void {
    const exclu = !m.exclu;
    const motif = exclu
      ? (prompt('Motif exclusion (optionnel) :', m.motif_override ?? '') ?? undefined)
      : undefined;

    this.groupesApi.toggleExclu(m.id, exclu, motif).subscribe({
      next: () => {
        this.membresDataSource?.setFilters({
          exclu: this.excluFilter === null ? null : this.excluFilter
        });
      },
      error: (err) => {
        console.error(err);
        alert('Modification impossible');
      }
    });
  }

  removeMembre(m: any): void {
    const label = this.getClientName(m);
    const ok = confirm(`Retirer ${label} du groupe ?`);
    if (!ok) return;

    this.groupesApi.removeMembre(m.id).subscribe({
      next: () => {
        this.membresDataSource?.setFilters({
          exclu: this.excluFilter === null ? null : this.excluFilter
        });
      },
      error: (err) => {
        console.error(err);
        alert('Suppression impossible');
      }
    });
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
      data: {
        groupeId: this.groupeId,
        client: this.resolveClient(row) ?? row?.client ?? row
      }
    });
  }
}
