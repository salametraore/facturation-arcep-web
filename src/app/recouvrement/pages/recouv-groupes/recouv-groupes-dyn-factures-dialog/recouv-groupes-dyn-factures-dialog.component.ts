import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LocalPageDataSource } from '../../../../rcv/local-page-datasource';
import { RcvGroupesApi } from '../../../../rcv/endpoints/rcv-groupes.api';

type DialogData = {
  groupeId: number;
  client: any; // {id, code, denomination, ...}
};

@Component({
  selector: 'recouv-groupes-dyn-factures-dialog',
  templateUrl: './recouv-groupes-dyn-factures-dialog.component.html',
  styleUrls: ['./recouv-groupes-dyn-factures-dialog.component.scss']
})
export class RecouvGroupesDynFacturesDialogComponent implements AfterViewInit {
  displayedColumns = ['reference', 'objet', 'produit_code', 'date_echeance', 'montant_restant', 'statut'];
  dataSource!: LocalPageDataSource<any>;

  search = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<RecouvGroupesDynFacturesDialogComponent>,
    private groupesApi: RcvGroupesApi
  ) {}

  ngAfterViewInit(): void {
    this.dataSource = new LocalPageDataSource<any>(
      this.paginator,
      this.sort,
      (q) => this.groupesApi.previewDynClientFactures(this.data.groupeId, this.data.client.id, q)
    );

    this.sort.active = 'date_echeance';
    this.sort.direction = 'desc';
  }

  applySearch(): void {
    this.dataSource.setSearch(this.search);
  }

  close(): void {
    this.ref.close();
  }
}

