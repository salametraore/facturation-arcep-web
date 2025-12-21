
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Observable, of } from 'rxjs';
import { LocalPageDataSource } from '../../../rcv/local-page-datasource';
import { PageResult } from '../../../rcv/rcv-query';

import { RcvPlansApi } from '../../../rcv/endpoints/rcv-plans.api';
import { RecouvPlansEditDialogComponent } from './recouv-plans-edit-dialog.component';

@Component({
  selector: 'recouv-plans',
  templateUrl: './recouv-plans.component.html',
  styleUrl: './recouv-plans.component.scss'
})
export class RecouvPlansComponent implements AfterViewInit {
  displayedColumns = ['code', 'nom',  'actif',  'actions'];

  dataSource!: LocalPageDataSource<any>;
  total$: Observable<number> = of(0);
  loading$: Observable<boolean> = of(false);

  search = '';
  actif: boolean | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;



  constructor(
    private api: RcvPlansApi,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.dataSource = new LocalPageDataSource<any>(
      this.paginator,
      this.sort,
      (q) => this.api.list(q) as PageResult<any>
    );

    this.total$ = this.dataSource.totalCount$();
    this.loading$ = this.dataSource.loadingState$();

    this.sort.active = 'priority';
    this.sort.direction = 'desc';

    this.applyFilters();
  }

  applySearch() {
    this.dataSource.setSearch(this.search);
  }

  applyFilters() {
    this.dataSource.setFilters({
      actif: this.actif === null ? null : this.actif
    });
  }

  clear() {
    this.search = '';
    this.actif = null;
    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  openCreate() {
    const ref = this.dialog.open(RecouvPlansEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(changed => {
      if (changed) this.applyFilters();
    });
  }

  openEdit(row: any) {
    const ref = this.dialog.open(RecouvPlansEditDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { mode: 'edit', planId: row.id }
    });

    ref.afterClosed().subscribe(changed => {
      if (changed) this.applyFilters();
    });
  }

  delete(row: any) {
    const ok = confirm(`Supprimer le plan "${row.nom}" ?`);
    if (!ok) return;
    this.api.delete(row.id);
    this.applyFilters();
  }
}
