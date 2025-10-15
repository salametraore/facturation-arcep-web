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
import { ReleveCompteClient} from "../../../shared/models/ligne-releve-compte-client";
import {RecouvDashboardClient} from "../../../shared/models/recouv-dashboard-client";

@Component({
  selector: 'app-client-crud',
  templateUrl: './client-crud.component.html',
  styleUrl: './client-crud.component.scss'
})
export class ClientCrudComponent implements OnInit,AfterViewInit {

  recouvDashboardClient?: RecouvDashboardClient;
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

  // Totaux à afficher
  totalFacture = 0;
  totalEncaissement = 0;
  soldeGlobal = 0; // Montant Facture + Montant Encaissement ( Montant Encaissement  etant negatif)


  displayedColumns: string[] = ['type_ligne','reference','date_echeance', 'montant_facture','montant_encaissement'];
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
    public dialogRef: MatDialogRef<ClientCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.recouvDashboardClient = data.recouvDashboardClient;
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
    const toTime = (d: any) => d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      console.log(this.recouvDashboardClient)
      if(this.recouvDashboardClient){
        this.client = clients?.find(c=>c.id ===this.recouvDashboardClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;

        this.clientService.getReleveCompteClientByIdClient(this.recouvDashboardClient?.client_id).subscribe((ligneReleveCompteClients: ReleveCompteClient[]) => {
          //this.t_ReleveCompteClient.data = ligneReleveCompteClients.filter(c=>c.id===this.recouvDashboardClient.client_id);
          console.log(ligneReleveCompteClients);
          const sorted = [...ligneReleveCompteClients].sort((a, b) => toTime(a?.date_echeance) - toTime(b?.date_echeance));
          this.t_ReleveCompteClient.data = sorted;
          this.paginator?.firstPage?.();
          this.recomputeTotals(); // <-- recalcul après chargement
        });
      }else{
        this.clientService.getReleveCompteClient().subscribe((ligneReleveCompteClients: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = ligneReleveCompteClients.filter(c=>c.id===this.recouvDashboardClient.client_id);
          this.recomputeTotals();
        });
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

  }

  private recomputeTotals(): void {
    const data = this.t_ReleveCompteClient?.filteredData ?? this.t_ReleveCompteClient?.data ?? [];
    this.totalFacture = data.reduce((sum, row: any) => sum + (Number(row?.montant_facture) || 0), 0);
    this.totalEncaissement = data.reduce((sum, row: any) => sum + (Number(row?.montant_encaissement) || 0), 0);
    this.soldeGlobal = this.totalFacture + this.totalEncaissement; // totalEncaissement etant negatif
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
