// src/app/parametres/pages/parametres-applicatifs/parametres-applicatifs.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Parametre } from '../../shared/models/parametres';
import { ParametreService } from '../../shared/services/parametres.services';
import { ParametresApplicatifsCrudComponent } from './parametres-applicatifs-crud/parametres-applicatifs-crud.component';

@Component({
  selector: 'parametres-applicatifs',
  templateUrl: './parametres-applicatifs.component.html'
})
export class ParametresApplicatifsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'key', 'value', 'is_active', 'updated_at', 'actions'];
  dataSource = new MatTableDataSource<Parametre>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ParametreService,
    private dialog: MatDialog
  ) {}

  // ✅ Charger ici (avant le 1er rendu stabilisé)
  ngOnInit(): void {
    this.load();
  }

  // ✅ Garder ici seulement les ViewChild
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.loading = true;
    this.api.getItems().subscribe({
      next: (rows) => {
        this.dataSource.data = rows ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilter(input: HTMLInputElement): void {
    input.value = '';
    this.applyFilter('');
  }

  open(row: Parametre): void {
    const ref = this.dialog.open(ParametresApplicatifsCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { id: row.id }
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }

  toggleActive(row: Parametre): void {
    this.api.patch(row.id, { is_active: !row.is_active }).subscribe({
      next: () => this.load()
    });
  }

  create(): void {
    const ref = this.dialog.open(ParametresApplicatifsCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {} // ✅ création
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }
}
