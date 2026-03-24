// src/app/recouvrement/rcv-promesses/pages/rcv-promesses-list/rcv-promesses-list.component.ts

import { AfterViewInit, Component, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageQuery } from '../../../rcv/rcv-query';
import { RcvPromessesApi, RcvPromesseEnriched, RcvPromesseStatut } from '../../../rcv/endpoints/rcv-promesses.api';
import {
  RecouvPromessesDetailsDialogComponent,
  RecouvPromesseDetailsDialogData
} from './recouv-promesses-details-dialog.component';
import {AuthzService} from "../../../authentication/authz.service";

@Component({
  selector: 'recouv-promesses',
  templateUrl: './recouv-promesses.component.html',
  styleUrls: ['./recouv-promesses.component.scss']
})
export class RecouvPromessesComponent implements AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();

  search = '';
  clientId: number | null = null;
  factureId: number | null = null;
  statut: RcvPromesseStatut | null = null;
  dateFrom: string | null = null;
  dateTo: string | null = null;

  statuts: RcvPromesseStatut[] = ['EN_COURS', 'RESPECTEE', 'NON_RESPECTEE'];

  displayedColumns: string[] = [
    'date_promesse',
    'client',
    'facture',
    'montant',
    'statut',
    'actions'
  ];

  dataSource = new MatTableDataSource<RcvPromesseEnriched>([]);
  total = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: RcvPromessesApi,
    private dialog: MatDialog,
    private authzService: AuthzService,
  ) {}

  ngAfterViewInit(): void {
    // 1er load
    this.load();

    // paginator
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());

    // sort
    this.sort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.load();
      });
  }

  hasOperationCode(opCode: string): boolean {
    return !!opCode && this.authzService.has(opCode);
  }

  hasAnyOperationCode(codes: string[]): boolean {
    return codes.some(code => this.authzService.has(code));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById = (_: number, row: RcvPromesseEnriched) => row.id;

  /** Recharge clients+factures (cache refs) */
  reloadRefs(): void {
    this.api.reloadRefs();
    this.paginator.pageIndex = 0;
    this.load();
  }

  applySearch(): void {
    this.paginator.pageIndex = 0;
    this.load();
  }

  applyFilters(): void {
    this.paginator.pageIndex = 0;
    this.load();
  }

  clear(): void {
    this.search = '';
    this.clientId = null;
    this.factureId = null;
    this.statut = null;
    this.dateFrom = null;
    this.dateTo = null;

    this.paginator.pageIndex = 0;
    this.load();
  }

  private load(): void {
    const q: PageQuery = {
      page: (this.paginator?.pageIndex ?? 0) + 1,
      pageSize: (this.paginator?.pageSize ?? 25),
      search: this.search?.trim() || '',
      sort: this.sort?.active
        ? `${this.sort.active},${this.sort.direction || 'asc'}`
        : 'date_promesse,asc'
    };

    this.api.list(q, {
      client_id: this.clientId ?? null,
      facture_id: this.factureId ?? null,
      statut: this.statut ?? null,
      dateFrom: this.dateFrom ?? null,
      dateTo: this.dateTo ?? null
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.dataSource.data = res.items;
        this.total = res.total;
      },
      error: (e) => console.error(e)
    });
  }

  clientLabel(row: RcvPromesseEnriched): string {
    return row.client?.denomination ?? `Client #${row.client_id}`;
  }

  factureLabel(row: RcvPromesseEnriched): string {
    if (!row.facture_id) return 'Promesse globale';
    return row.facture?.reference ?? `Facture #${row.facture_id}`;
  }

  openDetails(row: RcvPromesseEnriched): void {
    const ref = this.dialog.open(RecouvPromessesDetailsDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { mode: 'edit', id: row.id } as RecouvPromesseDetailsDialogData
    });

    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(changed => {
      if (changed) this.load();
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(RecouvPromessesDetailsDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { mode: 'create' } as RecouvPromesseDetailsDialogData
    });

    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(changed => {
      if (changed) this.load();
    });
  }


  openEdit(row: any) {

  }

  delete(row: any) {

  }
}
