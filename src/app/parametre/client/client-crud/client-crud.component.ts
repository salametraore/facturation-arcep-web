import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {Client} from "../../../shared/models/client";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../authentication/auth.service";
import {bouton_names, operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {LigneReleveCompteClient, ReleveCompteClient} from "../../../shared/models/ligne-releve-compte-client";
import {DetailFicheClient} from "../../../shared/models/detail-fiche-client";
import {RecouvDashboardClient} from "../../../shared/models/recouv-dashboard-client";

@Component({
  selector: 'app-client-crud',
  templateUrl: './client-crud.component.html',
  styleUrls: ['./client-crud.component.scss'] // Correction ici : styleUrl → styleUrls
})
export class ClientCrudComponent implements OnInit, AfterViewInit {

  // -------------------
  // 1️⃣ Propriétés TS initialisées
  // -------------------
  recouvDashboardClient?: RecouvDashboardClient;
  fixeCategorie?: number;
  form: FormGroup = {} as FormGroup; // initialisation
  mode: string = '';
  title: string = '';
  categories: CategorieProduit[] = []; // initialisation
  produits: Produit[] = [];
  clients: Client[] = [];
  client: Client = {} as Client;
  public operations = operations;
  public data_operation: string = '';
  errorMessage: any;
  nomClient: string = '';
  t_ReleveCompteClient: MatTableDataSource<ReleveCompteClient> = new MatTableDataSource<ReleveCompteClient>([]);

  displayedColumns: string[] = ['reference', 'date_echeance', 'montant_facture', 'montant_encaissement'];

  // -------------------
  // 2️⃣ ViewChild avec "!"
  // -------------------
  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    public dialogRef: MatDialogRef<ClientCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.recouvDashboardClient = data.recouvDashboardClient;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
  }

  ngOnInit(): void {
    this.reloadData();
  }

  ngAfterViewInit(): void {
    // -------------------
    // 3️⃣ Vérification avant d'assigner paginator et sort
    // -------------------
    if (this.t_ReleveCompteClient && this.paginator && this.sort) {
      this.t_ReleveCompteClient.paginator = this.paginator;
      this.t_ReleveCompteClient.sort = this.sort;
    }
  }

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      if (this.recouvDashboardClient) {
        // -------------------
        // 4️⃣ Protection contre undefined
        // -------------------
        this.client = clients.find(c => c.id === this.recouvDashboardClient?.client_id) ?? {} as Client;
        this.nomClient = this.client?.denomination_sociale ?? '';

        this.clientService.getReleveCompteClientByIdClient(this.client?.id).subscribe((ligneReleveCompteClients: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = ligneReleveCompteClients.filter(c => c.id === this.recouvDashboardClient?.client_id);
        });
      } else {
        this.clientService.getReleveCompteClient().subscribe((ligneReleveCompteClients: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = ligneReleveCompteClients.filter(c => c.id === this.recouvDashboardClient?.client_id);
        });
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie) ?? [];
    });
  }

  onSubmit() {
    console.log('this.techSheetForm.value');
  }

  onImport() {
    console.log('Importer des documents');
  }

  onNewClient() {
    console.log('Ajouter un nouveau client');
  }

  onFerme() {
    this.dialogRef.close('Yes');
  }

  onGetClient(client: Client) {
    this.client = client;
  }
}
