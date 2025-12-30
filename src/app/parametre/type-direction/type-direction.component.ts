// src/app/type-directions/pages/type-direction/type-direction.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { TypeDirection } from '../../shared/models/typeDirection';
import { TypeDirectionsService } from '../../shared/services/type-directions.services';
import { TypeDirectionCrudComponent } from './type-direction-crud/type-direction-crud.component';

@Component({
  selector: 'type-direction',
  templateUrl: './type-direction.component.html'
})
export class TypeDirectionComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'code', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<TypeDirection>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: TypeDirectionsService,
    private dialog: MatDialog
  ) {}

  // ✅ charger ici (évite NG0100)
  ngOnInit(): void {
    this.load();
  }

  // ✅ seulement ViewChild ici
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

  create(): void {
    const ref = this.dialog.open(TypeDirectionCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {}
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }

  edit(row: TypeDirection): void {
    const ref = this.dialog.open(TypeDirectionCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { id: row.id }
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }

  delete(row: TypeDirection): void {
    if (!confirm(`Supprimer le type direction "${row.code}" ?`)) return;
    this.api.delete(row.id).subscribe({
      next: () => this.load()
    });
  }
}
