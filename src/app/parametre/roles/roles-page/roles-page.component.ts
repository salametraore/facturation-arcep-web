// src/app/roles/roles-page.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Role } from '../../../shared/models/droits-utilisateur';
import { RoleService } from '../../../shared/services/role.services';
import { RoleCrudComponent } from '../role-crud/role-crud.component';

@Component({
  selector: 'roles-page',
  templateUrl: './roles-page.component.html'
})
export class RolesPageComponent implements OnInit, AfterViewInit {

  selectedRow: Role | undefined;

  displayedColumns: string[] = ['id', 'code', 'libelle',  'actions'];
  dataSource = new MatTableDataSource<Role>([]);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = false;

  constructor(
    private roles: RoleService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refresh();

    // ✅ filtre : code / libellé / opérations (code + libellé)
    this.dataSource.filterPredicate = (data: Role, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const id = (data.id ?? '').toString().toLowerCase();
      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const ops = this.getOperationsText(data).toLowerCase();

      return `${id} ${code} ${libelle} ${ops}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refresh(): void {
    this.loading = true;
    this.roles.getListItems().subscribe({
      next: rows => {
        this.dataSource.data = rows ?? [];
        if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
        this.loading = false;
      },
      error: _ => {
        this.loading = false;
      }
    });
  }

  /** (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  /** (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  openCreate(): void {
    const ref = this.dialog.open(RoleCrudComponent, { width: '1000px', data: null });
    ref.afterClosed().subscribe(ok => ok && this.refresh());
  }

  openEdit(row: Role): void {
    const ref = this.dialog.open(RoleCrudComponent, { width: '1000px', data: row });
    ref.afterClosed().subscribe(ok => ok && this.refresh());
  }

  remove(row: Role): void {
    if (!row.id) return;
    if (!confirm(`Supprimer le rôle "${row.libelle}" ?`)) return;

    this.roles.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Rôle supprimé', 'OK', { duration: 2000 });
        this.refresh();
      }
    });
  }

  onRowClicked(row: Role): void {
    this.selectedRow = (this.selectedRow === row) ? undefined : row;
  }

  getOpsCount(r: Role): number {
    return r.operations?.length ?? 0;
  }

  private getOperationsText(r: Role): string {
    const ops = r.operations ?? [];
    // Supporte {code, libelle} ou strings selon tes DTO
    return ops
      .map((o: any) => `${o?.code ?? ''} ${o?.libelle ?? ''}`.trim())
      .join(' ');
  }

}
