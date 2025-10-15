import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Client} from "../../../../shared/models/client";
import {Encaissement} from "../../../../shared/models/encaissement";
import {RecouvDashboardClient} from "../../../../shared/models/recouv-dashboard-client";
import {bouton_names, operations} from "../../../../constantes";

import {EncaissementsService} from "../../../../shared/services/encaissements.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ClientService} from "../../../../shared/services/client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../../authentication/auth.service";
import {RecouvListeEncaissement} from "../../../../shared/models/recouv-liste-encaissement";
import {ModePaiementService} from "../../../../shared/services/mode-paiement.service";
import {ModePaiement} from "../../../../shared/models/mode-paiement";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";


@Component({
  selector: 'client-encaissements',
  templateUrl: './client-encaissements.component.html',
  styleUrl: './client-encaissements.component.scss'
})
export class ClientEncaissementsComponent implements OnInit,AfterViewInit{

  displayedColumns: string[] = [ 'date_encaissement',  'montant', 'affecte', 'solde_non_affecte', 'mode_paiement'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;



  encaissements: RecouvListeEncaissement[];
  clients: Client[];
  client: Client;
  nomClient: any;

  modePaiements:  ModePaiement[];

  public operations = operations;
  public data_operation: string = '';

  recouvDashboardClient?: RecouvDashboardClient;
  t_Encaissements?: MatTableDataSource<RecouvListeEncaissement>;


  constructor(
    private encaissementsService: EncaissementsService,
    private modePaiementService: ModePaiementService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ClientEncaissementsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  )
  {
    this.recouvDashboardClient = data.detailFicheClient;
    this.data_operation = data.operation;
    this.t_Encaissements = new MatTableDataSource<RecouvListeEncaissement>([]);
  }



  ngAfterViewInit() {
    this.t_Encaissements.paginator = this.paginator;
    this.t_Encaissements.sort = this.sort;
  }
  ngOnInit(): void {
    this.reloadData();
  }

  private reloadData() {

    this.modePaiementService.getItems().subscribe((ligneModePaiements: ModePaiement[]) => {
      this.modePaiements = ligneModePaiements;
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      console.log("recouvDashboardClient")
      console.log(this.recouvDashboardClient)
      if(this.recouvDashboardClient){
        this.client = clients?.find(c=>c.id ===this.recouvDashboardClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;
        this.encaissementsService.getListeEncaissementsByClientId(this.recouvDashboardClient?.client_id).subscribe((lignesEncaissement: RecouvListeEncaissement[]) => {
          console.log(lignesEncaissement);
          this.encaissements=lignesEncaissement;
          this.t_Encaissements.data = this.encaissements;

        });
      }
    });
  }



  getModePaiement(id: number) {
    return this.modePaiements?.find(mode => mode.id === id).libelle;
  }
}
