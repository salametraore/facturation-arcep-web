import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations} from "../../constantes";
import {EncaissementsService} from "../../shared/services/encaissements.service";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {ModePaiement} from "../../shared/models/mode-paiement";
import {ModePaiementService} from "../../shared/services/mode-paiement.service";
import {EncaissementCrudComponent} from "./encaissement-crud/encaissement-crud.component";
import {RecouvListeEncaissement} from "../../shared/models/recouv-liste-encaissement";
import {EncaissementDetail} from "../../shared/models/encaissementDetail";
import {Encaissement} from "../../shared/models/encaissement";

@Component({
  selector: 'app-encaissement',
  templateUrl: './encaissement.component.html',
  styleUrl: './encaissement.component.scss'
})
export class EncaissementComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;
  t_RecouvListeEncaissement?: MatTableDataSource<RecouvListeEncaissement>;

  displayedColumns: string[] = ['client','montant','affecte','solde_non_affecte', 'date_encaissement','mode_paiement', 'actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient:any;
  startDate :any;
  endDate :any;
  serviceFilter :any;
  modeFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  produits:Produit[];
  clients: Client[];
  modePaiements: ModePaiement[];

  constructor(
    private encaissementsService: EncaissementsService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private modePaiementService: ModePaiementService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_RecouvListeEncaissement = new MatTableDataSource<RecouvListeEncaissement>([]);
  }

  ngAfterViewInit(): void {
    this.t_RecouvListeEncaissement.paginator = this.paginator;
    this.t_RecouvListeEncaissement.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;
  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories= categories;
    });
    this.modePaiementService.getItems().subscribe((modePaiements: ModePaiement[]) => {
      this.modePaiements= modePaiements;
    });
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f=>f.categorieProduit===this.fixeCategorie);
    });
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });
    this.encaissementsService.getListencaissement().subscribe((response: RecouvListeEncaissement[]) => {
      this.t_RecouvListeEncaissement.data = response;
      console.log(response)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_RecouvListeEncaissement.filter = filterValue.trim().toLowerCase();
  }

  crud(encaissement: RecouvListeEncaissement, operation?: string) {

    if(encaissement){
      console.log(encaissement?.encaissement_id)
      this.encaissementsService.getItem(encaissement?.encaissement_id).subscribe((encaissementDetail: EncaissementDetail) => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '1024px';
        dialogConfig.autoFocus = true;
        dialogConfig.data = {encaissementDetail, operation};
        dialogConfig.disableClose = true;
        let ref = this.dialog.open(EncaissementCrudComponent, dialogConfig);
        ref.afterClosed().subscribe(() => {
          this.reloadData();
        }, error => {

        });
      });
    }else{
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '1024px';
      dialogConfig.autoFocus = true;
      dialogConfig.data = {operation};
      dialogConfig.disableClose = true;
      let ref = this.dialog.open(EncaissementCrudComponent, dialogConfig);
      ref.afterClosed().subscribe(() => {
        this.reloadData();
      }, error => {

      });
    }


  }

  onRowClicked(row) {
    if (this.selectedRow && this.selectedRow != row) {
      this.selectedRow = row;
    } else if (!this.selectedRow) {
      this.selectedRow = row;
    } else if (this.selectedRow === row) {
      this.selectedRow = undefined;
    }
    console.log(row)
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

  }

  checher() {

  }

  getCategorie(id:number){
    return this.categories?.find(cat=>cat.id===id).libelle;
  }

}

