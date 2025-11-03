import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {bouton_names, operations} from "../../../../constantes";
import {RecouvDashboardClient} from "../../../../shared/models/recouv-dashboard-client";
import {Client} from "../../../../shared/models/client";
import {Facture} from "../../../../shared/models/facture";
import {FactureService} from "../../../../shared/services/facture.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ClientService} from "../../../../shared/services/client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../../authentication/auth.service";

import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'client-details-factures',
  templateUrl: './client-details-factures.component.html',
  styleUrls: ['./client-details-factures.component.scss']
})
export class ClientDetailsFacturesComponent implements OnInit,AfterViewInit{

  displayedColumns: string[] = [ 'objet', 'date_echeance', 'montant', 'type_frais',  'etat'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ///dataSource = new MatTableDataSource<Facture>(FACTURES_DATA);

  factures: Facture[];
  clients: Client[];
  client: Client;
  nomClient: any;

  public operations = operations;
  public data_operation: string = '';

  recouvDashboardClient?: RecouvDashboardClient;
  t_Factures?: MatTableDataSource<Facture>;

  constructor(private factureService: FactureService,
              private categorieProduitService: CategorieProduitService,
              private clientService: ClientService,
              public dialog: MatDialog,
              public dialogService: DialogService,
              private msgMessageService: MsgMessageServiceService,
              public dialogRef: MatDialogRef<ClientDetailsFacturesComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private authServiceService: AuthService,
  ) {
    this.recouvDashboardClient = data.detailFicheClient;
    this.data_operation = data.operation;
    this.t_Factures = new MatTableDataSource<Facture>([]);
  }


  ngAfterViewInit() {
    this.t_Factures.paginator = this.paginator;
    this.t_Factures.sort = this.sort;
  }
  ngOnInit(): void {
    this.reloadData();
  }


  private reloadData() {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      console.log("recouvDashboardClient")
      console.log(this.recouvDashboardClient)
      if(this.recouvDashboardClient){
        this.client = clients?.find(c=>c.id ===this.recouvDashboardClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;
        this.factureService.getListeFacturesByClientId(this.recouvDashboardClient?.client_id).subscribe((lignesFactures: Facture[]) => {
         console.log(lignesFactures);
          this.factures=lignesFactures;
          this.t_Factures.data = this.factures;
        });
      }
    });
  }

}

