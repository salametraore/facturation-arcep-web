import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {PdfViewService} from "../../shared/services/pdf-view.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations, TYPE_FRAIS} from "../../constantes";
import {DevisFactureCrudComponent} from "./devis-facture-crud/devis-facture-crud.component";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {Facture} from "../../shared/models/facture";
import {FactureService} from "../../shared/services/facture.service";
import {HttpResponse} from "@angular/common/http";
import {EncaissementDirectCrudComponent} from "../encaissement-direct/encaissement-direct-crud/encaissement-direct-crud.component";
import {GenerationRedevanceCrudComponent} from "../generation-redevance/generation-redevance-crud/generation-redevance-crud.component";

@Component({
  selector: 'app-devis-facture',
  templateUrl: './devis-facture.component.html',
  styleUrl: './devis-facture.component.scss'
})
export class DevisFactureComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;

  t_Facture?: MatTableDataSource<Facture>;
  displayedColumns: string[] = ['reference','client','montant', 'date_echeance','objet', 'etat','actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient:any;
  startDate :any;
  endDate :any;
  serviceFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  produits:Produit[];
  statutFicheTechniques: StatutFicheTechnique[];
  clients: Client[];

  TYPE_FRAIS=TYPE_FRAIS;

  constructor(
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private pdfViewService: PdfViewService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_Facture = new MatTableDataSource<Facture>([]);
  }

  ngAfterViewInit(): void {
    this.t_Facture.paginator = this.paginator;
    this.t_Facture.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;
  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories= categories;
    });
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f=>f.categorieProduit===this.fixeCategorie);
    });
    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
    });
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.factureService.getListItems().subscribe((response: Facture[]) => {
      this.t_Facture.data = response;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_Facture.filter = filterValue.trim().toLowerCase();
  }

  crud(facture: Facture, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {facture, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(DevisFactureCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(facture: Facture) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.factureService
          .delete(facture.id)
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

  }

  checher() {

  }

  getCategorie(id:number){
    return this.categories?.find(cat=>cat.id===id)?.libelle;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id)?.libelle;
  }

  getClient(id: number) {
    return this.clients?.find(c => c.id === id)?.denomination_sociale;
  }

  onPrint(facture: Facture) {
    this.factureService.genererFacturePDF(facture?.id).subscribe((response: HttpResponse<Blob>)=>{
        this.pdfViewService.printDirectly(response);
      },
      error => {
        this.dialogService.alert({message: error});
      })
  }

  openGenererRedevancesAnnuelles(): void {
    const dialogRef = this.dialog.open(GenerationRedevanceCrudComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      data: {}
    });
    dialogRef.afterClosed().subscribe(() => {
      // rafraîchir si nécessaire
      this.checher?.();
    });
  }

}
