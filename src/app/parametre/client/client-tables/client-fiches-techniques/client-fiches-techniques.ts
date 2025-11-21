import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {FicheTechniquesService} from "../../../../shared/services/fiche-techniques.service";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../../shared/services/produits.service";
import {Produit} from "../../../../shared/models/produit";
import {FicheTechniques} from "../../../../shared/models/ficheTechniques";
import {StatutFicheTechnique} from "../../../../shared/models/statut-fiche-technique";
import {StatutFicheTechniqueService} from "../../../../shared/services/statut-fiche-technique.service";
import {Client} from "../../../../shared/models/client";
import {ClientService} from "../../../../shared/services/client.service";
import {MatSort} from "@angular/material/sort";
import {date_converte, operations} from "../../../../constantes";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {RecouvDashboardClient} from "../../../../shared/models/recouv-dashboard-client";
import {RecouvListeEncaissement} from "../../../../shared/models/recouv-liste-encaissement";
import {EncaissementsService} from "../../../../shared/services/encaissements.service";
import {AuthService} from "../../../../authentication/auth.service";

@Component({
  selector: 'client-fiches-techniques',
  templateUrl: './client-fiches-techniques.html'
})
export class ClientFichesTechniques implements OnInit,AfterViewInit{

  displayedColumns: string[] = ['objet', 'date_creation', 'categorie_produit', 'statut.libelle'];

  selection = new SelectionModel<FicheTechniques>(true, []);

  ficheTechniques?: FicheTechniques[];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient: any;
  startDate: any;
  endDate: any;
  serviceFilter: any;
  statusFilter: any;
  categories: CategorieProduit[];
  produits: Produit[];
  statutFicheTechniques: StatutFicheTechnique[];
  clients: Client[];
  client: Client;

  public data_operation: string = '';

  recouvDashboardClient?: RecouvDashboardClient;
  t_FicheTechniques?: MatTableDataSource<FicheTechniques>;

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ClientFichesTechniques>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  )
  {
    this.recouvDashboardClient = data.detailFicheClient;
    this.data_operation = data.operation;
    this.t_FicheTechniques = new MatTableDataSource<FicheTechniques>([]);
  }


  ngAfterViewInit() {
    this.t_FicheTechniques.paginator = this.paginator;
    this.t_FicheTechniques.sort = this.sort;
  }
  ngOnInit(): void {
    this.reloadData();
  }

  private reloadData() {

    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
    });
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits;
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      console.log("recouvDashboardClient")
      console.log(this.recouvDashboardClient)
      if(this.recouvDashboardClient){
        this.client = clients?.find(c=>c.id ===this.recouvDashboardClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;
        this.ficheTechniquesService.getListeFichesTechniquesByClientId(this.recouvDashboardClient?.client_id).subscribe((ligneFicheTechniques: FicheTechniques[]) => {
          console.log(ligneFicheTechniques);
          this.ficheTechniques=ligneFicheTechniques;
          this.t_FicheTechniques.data = this.ficheTechniques;

        });
      }
    });
  }


  getCategorie(id: number) {
    return this.categories?.find(cat => cat.id === id).libelle;
  }


  onGetClient(item: Client) {
    this.client = item;
  }



  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id).libelle;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.t_FicheTechniques.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.t_FicheTechniques.data.forEach(row => this.selection.select(row));
    }
  }
}
