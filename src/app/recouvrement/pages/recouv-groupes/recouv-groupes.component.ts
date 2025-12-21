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
      if (changed) this.applyFilters();
    });
  }

  openEdit(row: any) {
    const ref = this.dialog.open(RecouvGroupesEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'edit', groupeId: row.id }
    });

    ref.afterClosed().subscribe((changed) => {
      if (changed) this.applyFilters();
    });
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
    this.groupesApi.delete(row.id);
    this.applyFilters();
  }
}
