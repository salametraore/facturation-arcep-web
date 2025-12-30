//src\app\parametre\clients\clients.component.ts
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Client } from '../../shared/models/client';
import { ClientService } from '../../shared/services/client.service';

//,
//   styleUrls: ['./clients.component.scss'


@Component({
  selector: 'clients',
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'denomination_sociale', 'compte_comptable', 'telephone', 'email', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // (optionnel) filtrer sur plusieurs colonnes
    this.dataSource.filterPredicate = (row: Client, filter: string) => {
      const f = (filter || '').trim().toLowerCase();
      const haystack = [
        row.id,
        row.denomination_sociale,
        row.compte_comptable,
        row.telephone,
        row.email
      ]
        .filter(v => v !== null && v !== undefined)
        .join(' ')
        .toLowerCase();

      return haystack.includes(f);
    };

    this.load();
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

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').trim().toLowerCase();

    // reset page si on filtre
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  create() {
    // ✅ /parametre/clients/new
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  edit(row: Client) {
    // ✅ /parametre/clients/:id
    this.router.navigate([row.id], { relativeTo: this.route });
  }
}
