// src/app/roles/roles-page.component.ts
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {RequestPostRole, Role} from '../../../shared/models/droits-utilisateur';
import {RoleService} from '../../../shared/services/role.services';
import {RoleCrudComponent} from '../role-crud/role-crud.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'roles-page',
  templateUrl: './roles-page.component.html',
  styles: [`.toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0
  }`]
})
export class RolesPageComponent implements OnInit {
  displayedColumns = ['id', 'code', 'libelle', 'opsCount', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = false;

  constructor(
    private roles: RoleService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.refresh();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  refresh() {
    this.loading = true;
    this.roles.getListItems().subscribe({
      next: rows => {
        this.dataSource.data = rows;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: _ => {
        this.loading = false;
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(RoleCrudComponent, {width: '700px', data: null});
    ref.afterClosed().subscribe(ok => ok && this.refresh());
  }

  openEdit(row: Role) {
    const ref = this.dialog.open(RoleCrudComponent, {width: '700px', data: row});
    ref.afterClosed().subscribe(ok => ok && this.refresh());
  }

  remove(row: Role) {
    if (!row.id) return;
    if (!confirm(`Supprimer le rôle "${row.libelle}" ?`)) return;
    this.roles.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Rôle supprimé', 'OK', {duration: 2000});
        this.refresh();
      }
    });
  }
}
