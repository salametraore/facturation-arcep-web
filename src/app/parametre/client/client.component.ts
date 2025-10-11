import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ClientCrudComponent} from "./client-crud/client-crud.component";
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {Client} from "../../shared/models/client";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations} from "../../constantes";
import {DetailFicheClient} from "../../shared/models/detail-fiche-client";
import {ClientTablesComponent} from "./client-tables/client-tables.component";
import {RecouvDashboardClient} from "../../shared/models/recouv-dashboard-client";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie: number;

  t_RecouvDashboardClient?: MatTableDataSource<RecouvDashboardClient>;


  displayedColumns: string[] = ['client', 'compte_comptable','nbre_factures_impayes', 'total_du','avance_du', 'actions'];
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
  detailFicheClients: DetailFicheClient[];

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_RecouvDashboardClient = new MatTableDataSource<RecouvDashboardClient>([]);
  }

  ngAfterViewInit(): void {
    this.t_RecouvDashboardClient.paginator = this.paginator;
    this.t_RecouvDashboardClient.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;
  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.clientService.getDetailFicheClients().subscribe((detailFicheClients: RecouvDashboardClient[]) => {
      this.t_RecouvDashboardClient.data = detailFicheClients;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_RecouvDashboardClient.filter = filterValue.trim().toLowerCase();
  }

  crud(recouvDashboardClient: RecouvDashboardClient, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {recouvDashboardClient, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(ClientCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onViewfiche(detailFicheClient: DetailFicheClient, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    const fixeCategorie = this.fixeCategorie;
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {detailFicheClient, fixeCategorie, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(ClientTablesComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(ficheTechniques: FicheTechniques) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.ficheTechniquesService
          .delete(ficheTechniques.id)
          .subscribe(
            (data) => {
              this.msgMessageService.success('Supprimé avec succès');
              this.reloadData();
            },
            (error => {
              this.dialogService.alert({message: error});
            })
          );
      }
    });
  }

  onRowClicked(row) {
    if (this.selectedRow && this.selectedRow != row) {
      this.selectedRow = row;
    } else if (!this.selectedRow) {
      this.selectedRow = row;
    } else if (this.selectedRow === row) {
      this.selectedRow = undefined;
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'transmis':
        return 'status-transmis';
      case 'en attente':
        return 'status-en-attente';
      case 'clos':
        return 'status-clos';
      case 'abandon':
        return 'status-abandon';
      default:
        return '';
    }
  }

  reset() {
    this.nomClient = null;
    this.client = undefined;
    this.clientService.getDetailFicheClients().subscribe((detailFicheClients: RecouvDashboardClient[]) => {
      this.t_RecouvDashboardClient.data = detailFicheClients;
    });
  }

  checher() {
    this.clientService.getReleveCompteClientByIdClient(this.client?.id).subscribe((detailFicheClients: RecouvDashboardClient[]) => {
      this.t_RecouvDashboardClient.data = detailFicheClients;
    });
  }

  getCategorie(id: number) {
    return this.categories?.find(cat => cat.id === id).libelle;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id).libelle;
  }


  onGetClient(item: Client) {
    this.client = item;
  }
}
