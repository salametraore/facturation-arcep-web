import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'client-factures',
  templateUrl: './client-factures.component.html',
  styleUrl: './client-factures.component.scss'
})
export class ClientFacturesComponent implements OnInit,AfterViewInit{

  displayedColumns: string[] = ['select', 'numeroFacture', 'libelle', 'echeance', 'montant', 'resteDu', 'penalites', 'statut'];
  dataSource = new MatTableDataSource<Facture>(FACTURES_DATA);
  selection = new SelectionModel<Facture>(true, []);

  constructor() {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  ngOnInit(): void {
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }
}

export interface Facture {
  numeroFacture: string;
  libelle: string;
  echeance: string;
  montant: string;
  resteDu: string;
  penalites: string;
  statut: string;
}

const FACTURES_DATA: Facture[] = [
  { numeroFacture: 'FAC-9001', libelle: 'libellé de la facture', echeance: '30/06/2025', montant: '80 000 XOF', resteDu: '80 000 XOF', penalites: '0 XOF', statut: 'Impayée' },
  { numeroFacture: 'FAC-9002', libelle: 'libellé de la facture', echeance: '15/07/2025', montant: '20 000 XOF', resteDu: '20 000 XOF', penalites: '0 XOF', statut: 'Impayée' },
  { numeroFacture: 'FAC-9003', libelle: 'libellé de la facture', echeance: '20/07/2025', montant: '15 000 XOF', resteDu: '15 000 XOF', penalites: '0 XOF', statut: 'Litige' },
];
