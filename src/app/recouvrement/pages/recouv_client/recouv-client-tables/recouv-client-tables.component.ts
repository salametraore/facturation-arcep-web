import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Facture} from "../../../../shared/models/facture";
import {Client} from "../../../../shared/models/client";
import {RecouvDashboardClient} from "../../../../shared/models/recouv-dashboard-client";
import {bouton_names, operations} from "../../../../constantes";
import {DetailFicheClient} from "../../../../shared/models/detail-fiche-client";
import {FactureService} from "../../../../shared/services/facture.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ClientService} from "../../../../shared/services/client.service";

@Component({
  selector: 'recouv-client-tables',
  templateUrl: './recouv-client-tables.component.html'
})
export class RecouvClientTablesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'numeroFacture', 'libelle', 'echeance', 'montant', 'resteDu', 'penalites', 'statut'];
  ///dataSource = new MatTableDataSource<Facture>(FACTURES_DATA);
  selection = new SelectionModel<Facture>(true, []);

  factures: Facture[];
  clients: Client[];
  client: Client;
  nomClient: any;

  public operations = operations;
  public data_operation: string = '';

  detailFicheClient?: RecouvDashboardClient;
  t_Factures?: MatTableDataSource<Facture>;


  constructor(
    public dialogRef: MatDialogRef<RecouvClientTablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private clientService: ClientService,
  ) {
    this.detailFicheClient = data.detailFicheClient;
    this.data_operation = data.operation;
    this.t_Factures = new MatTableDataSource<Facture>([]);
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
  //  this.t_Factures.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.reloadData();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.t_Factures.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.t_Factures.data.forEach(row => this.selection.select(row));
    }
  }

  onFermer() {
    this.dialogRef.close('Yes');
  }

  private reloadData() {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      if(this.detailFicheClient){
        this.client = clients?.find(c=>c.id ===this.detailFicheClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;

        this.factureService.getListeFacturesByClientId(this.detailFicheClient?.client_id).subscribe((lignesFactures: Facture[]) => {

          this.factures=lignesFactures;
          this.t_Factures.data = this.factures;
        });
      }
    });
  }


}

