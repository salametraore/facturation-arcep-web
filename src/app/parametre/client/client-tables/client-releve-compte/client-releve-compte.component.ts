import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DetailFicheClient} from "../../../../shared/models/detail-fiche-client";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";
import {Produit} from "../../../../shared/models/produit";
import {Client} from "../../../../shared/models/client";
import {MatTableDataSource} from "@angular/material/table";
import {ReleveCompteClient} from "../../../../shared/models/ligne-releve-compte-client";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FicheTechniquesService} from "../../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../../shared/services/produits.service";
import {ClientService} from "../../../../shared/services/client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../../authentication/auth.service";
import {operations} from "../../../../constantes";

@Component({
  selector: 'client-releve-compte',
  templateUrl: './client-releve-compte.component.html',
  styleUrl: './client-releve-compte.component.scss'
})
export class ClientReleveCompteComponent implements OnInit,AfterViewInit {

  detailFicheClient?: DetailFicheClient;
  fixeCategorie?: number;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  categories: CategorieProduit[];
  produits: Produit[];
  clients: Client[];
  client: Client;
  public operations = operations;
  public data_operation: string = '';
  errorMessage: any;
  nomClient: any;
  t_ReleveCompteClient?: MatTableDataSource<ReleveCompteClient>;

  displayedColumns: string[] = ['date_echeance', 'reference','montant_facture','montant_encaissement'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ClientReleveCompteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.detailFicheClient = data.detailFicheClient;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
    this.t_ReleveCompteClient = new MatTableDataSource<ReleveCompteClient>([]);
  }

  ngOnInit(): void {
    this.reloadData();
  }

  ngAfterViewInit(): void {
    this.t_ReleveCompteClient.paginator = this.paginator;
    this.t_ReleveCompteClient.sort = this.sort;
  }

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      if(this.detailFicheClient){
        this.client = clients?.find(c=>c.id ===this.detailFicheClient?.id_client);
        this.nomClient = this.client?.denomination_sociale;
        this.clientService.getReleveCompteClientByIdClient(this.client?.id).subscribe((ReleveCompteClients: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = ReleveCompteClients.filter(c=>c.id===this.detailFicheClient.id_client);
        });
      }else{
        this.clientService.getReleveCompteClient().subscribe((ReleveCompteClients: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = ReleveCompteClients.filter(c=>c.id===this.detailFicheClient.id_client);
        });
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

  }

  onSubmit() {
    // Logique pour soumettre la fiche technique
    console.log('this.techSheetForm.value');
  }

  onImport() {
    // Logique pour importer des documents
    console.log('Importer des documents');
  }

  onNewClient() {
    // Logique pour ajouter un nouveau client
    console.log('Ajouter un nouveau client');
  }

  onFerme() {
    this.dialogRef.close('Yes');
  }

  onGetClient(client: Client) {
    this.client = client;
  }
}
