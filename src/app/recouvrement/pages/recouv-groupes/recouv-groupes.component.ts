import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LocalPageDataSource } from '../../../rcv/local-page-datasource';
import { RcvGroupesApi } from '../../../rcv/endpoints/rcv-groupes.api';

import { RecouvGroupesEditDialogComponent } from '../recouv-groupes/recouv-groupes-edit-dialog/recouv-groupes-edit-dialog.component';

type GroupeType = 'MANUEL' | 'DYNAMIQUE';

@Component({
  selector: 'recouv-groupes',
  templateUrl: './recouv-groupes.component.html',
  styleUrls: ['./recouv-groupes.component.scss']
})
export class RecouvGroupesComponent implements AfterViewInit {
  displayedColumns = ['code', 'nom', 'type_groupe', 'priority', 'actif', 'actions'];

  dataSource!: LocalPageDataSource<any>;

  search = '';
  actif: boolean | null = null;
  typeGroupe: GroupeType | null = null;

  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private groupesApi: RcvGroupesApi,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.dataSource = new LocalPageDataSource<any>(
      this.paginator,
      this.sort,
      (q) => this.groupesApi.list(q)
    );

    this.sort.active = 'priority';
    this.sort.direction = 'desc';

    // applique les filtres init
    this.applyFilters();
  }

  applySearch() {
    this.dataSource.setSearch(this.search);
  }

  applyFilters() {
    this.dataSource.setFilters({
      actif: this.actif === null ? null : this.actif,
      type_groupe: this.typeGroupe === null ? null : this.typeGroupe
    });
  }

  clear() {
    this.search = '';
    this.actif = null;
    this.typeGroupe = null;
    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  openCreate() {
    const ref = this.dialog.open(RecouvGroupesEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((changed) => {
      if (!changed) return;

      // revenir à la 1ère page (optionnel mais conseillé)
      this.paginator?.firstPage?.();

      // forcer le reload (même si filtres identiques)
      this.dataSource.setFilters({
        actif: this.actif,
        type_groupe: this.typeGroupe,
        __ts: Date.now()
      });

      // garder la recherche courante
      this.dataSource.setSearch(this.search);
    });

  }

  openEdit(row: any) {
    const ref = this.dialog.open(RecouvGroupesEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'edit', groupeId: row.id }
    });

    ref.afterClosed().subscribe((changed) => {
      if (!changed) return;

      // revenir à la 1ère page (optionnel mais conseillé)
      this.paginator?.firstPage?.();

      // forcer le reload (même si filtres identiques)
      this.dataSource.setFilters({
        actif: this.actif,
        type_groupe: this.typeGroupe,
        __ts: Date.now()
      });

      // garder la recherche courante
      this.dataSource.setSearch(this.search);
    });
  }

  /** Force le rechargement de la liste (même si filtres identiques) */
  private refreshList(): void {
    // optionnel : revenir à la 1ère page
    this.paginator?.firstPage?.();

    // force un "tick" de filtres (nouvelle référence + timestamp)
    this.dataSource.setFilters({
      actif: this.actif,
      type_groupe: this.typeGroupe,
      __ts: Date.now() // clé "dummy" pour forcer la relance
    });

    // (facultatif) si tu veux aussi relancer la recherche courante :
    this.dataSource.setSearch(this.search);
  }

  // Optionnel: ouvre direct sur l'onglet membres (si tu veux gérer ça dans le dialog)
  openMembers(row: any) {
    this.dialog.open(RecouvGroupesEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'edit', groupeId: row.id, tab: 'membres' } as any
    }).afterClosed().subscribe((changed) => {
      if (changed) this.applyFilters();
    });
  }

  delete(row: any) {
    const ok = confirm(`Supprimer le groupe "${row.nom}" ?`);
    if (!ok) return;

    this.groupesApi.delete(row.id).subscribe({
      next: () => this.applyFilters(),
      error: () => alert("Suppression impossible")
    });
  }


}
