import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Observable, of } from 'rxjs';
import { LocalPageDataSource } from '../../../rcv/local-page-datasource';
import { PageResult } from '../../../rcv/rcv-query';

import { RcvTemplatesApi } from '../../../rcv/endpoints/rcv-templates.api';
import { RecouvTemplatesEditDialogComponent } from './recouv-templates-edit-dialog.component';

type CanalSeed = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';
type CanalUi = 'EMAIL' | 'SMS' | 'APPEL' | 'COURRIER' | null;

@Component({
  selector: 'recouv-templates',
  templateUrl: './recouv-templates.component.html',
  styleUrls: ['./recouv-templates.component.scss']
})
export class RecouvTemplatesComponent implements AfterViewInit {
  displayedColumns = ['nom', 'canal', 'sujet', 'actif', 'actions'];

  dataSource!: LocalPageDataSource<any>;
  total$: Observable<number> = of(0);
  loading$: Observable<boolean> = of(false);

  // admin pro
  compact = true;

  // filtres
  search = '';
  actif: boolean | null = null;
  canal: CanalUi = null;

  // preview rapide
  previewId: number | null = null;

  readonly canalsUi: { value: CanalUi; label: string }[] = [
    { value: null, label: 'Tous' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'SMS', label: 'SMS' },
    { value: 'APPEL', label: 'Appel' },
    { value: 'COURRIER', label: 'Courrier' }, // maps to seed LETTRE
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: RcvTemplatesApi,
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

    this.sort.active = 'nom';
    this.sort.direction = 'asc';

    this.applyFilters();
  }

  applySearch() {
    this.dataSource.setSearch(this.search);
  }

  applyFilters() {
    // mapping UI -> seed
    // UI COURRIER correspond au seed LETTRE
    const canalSeed: CanalSeed | null =
      this.canal === 'COURRIER' ? 'LETTRE' : (this.canal as any);

    this.dataSource.setFilters({
      actif: this.actif === null ? null : this.actif,
      canal: canalSeed === null ? null : canalSeed
    });
  }

  clear() {
    this.search = '';
    this.actif = null;
    this.canal = null;
    this.previewId = null;
    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  canalLabelSeed(canal: string): string {
    const c = String(canal || '').toUpperCase();
    if (c === 'LETTRE') return 'Courrier';
    if (c === 'EMAIL') return 'Email';
    if (c === 'SMS') return 'SMS';
    if (c === 'APPEL') return 'Appel';
    return c;
  }

  togglePreview(row: any) {
    this.previewId = (this.previewId === row.id) ? null : row.id;
  }

  previewSubject(row: any): string {
    const sujet = String(row?.sujet ?? '').trim();
    return sujet ? sujet : '—';
  }

  previewBody(row: any): string {
    const txt = String(row?.contenu ?? '').trim().replace(/\s+/g, ' ');
    if (!txt) return '—';
    return txt.length > 180 ? txt.slice(0, 180) + '…' : txt;
  }

  openCreate() {
    this.dialog.open(RecouvTemplatesEditDialogComponent, {
      width: '1100px',
      maxWidth: '98vw',
      data: { mode: 'create' }
    }).afterClosed().subscribe(changed => {
      if (changed) this.applyFilters();
    });
  }

  openEdit(row: any) {
    this.dialog.open(RecouvTemplatesEditDialogComponent, {
      width: '1100px',
      maxWidth: '98vw',
      data: { mode: 'edit', templateId: row.id }
    }).afterClosed().subscribe(changed => {
      if (changed) this.applyFilters();
    });
  }

  delete(row: any) {
    const ok = confirm(`Supprimer le modèle "${row.nom}" ?`);
    if (!ok) return;
    this.api.delete(row.id);
    this.applyFilters();
  }

  trackById(_: number, r: any) {
    return r?.id;
  }
}
