// src/app/directions/pages/direction/direction.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Direction } from '../../shared/models/direction';
import { DirectionsService } from '../../shared/services/directions.services';
import { DirectionCrudComponent } from './direction-crud/direction-crud.component';
import {TypeDirection} from "../../shared/models/typeDirection";
import {TypeDirectionsService} from "../../shared/services/type-directions.services";

@Component({
  selector: 'app-direction',           // ✅ important : selector correct
  templateUrl: './direction.component.html'
})
export class DirectionComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'libelle', 'type_direction', 'actions'];
  dataSource = new MatTableDataSource<Direction>([]);
  loading = false;
  typeDirections: TypeDirection[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: DirectionsService,
    private typeApi: TypeDirectionsService,
    private dialog: MatDialog
  ) {
    // ✅ filtre : sur toutes les colonnes (défini tôt)
    this.dataSource.filterPredicate = (row, filter) => {
      const f = (filter || '').toLowerCase();
      return (
        String(row.id).includes(f) ||
        (row.libelle || '').toLowerCase().includes(f) ||
        String(row.type_direction).includes(f)
      );
    };
  }

  // ✅ charge ici (évite NG0100)
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

    this.typeApi.getItems().subscribe({
      next: (rows) => (this.typeDirections = rows ?? []),
      error: () => (this.typeDirections = [])
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
    const ref = this.dialog.open(DirectionCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {}
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }

  edit(row: Direction): void {
    const ref = this.dialog.open(DirectionCrudComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { id: row.id }
    });

    ref.afterClosed().subscribe((changed: boolean) => {
      if (changed) this.load();
    });
  }

  delete(row: Direction): void {
    if (!confirm(`Supprimer la direction "${row.libelle}" ?`)) return;
    this.api.delete(row.id).subscribe({
      next: () => this.load()
    });
  }

  getLibelleTypeDirection(id: number) {
    return this.typeDirections?.find(types => types.id === id).libelle;
  }
}
