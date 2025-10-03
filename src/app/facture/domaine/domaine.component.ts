import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {operations} from "../../constantes";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {DialogService} from "../../shared/services/dialog.service";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {Produit} from "../../shared/models/produit";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {DomaineCrudComponent} from "./domaine-crud/domaine-crud.component";
import {AvisEtuteTechniqueDialodComponent} from "../avis-etute-technique-dialod/avis-etute-technique-dialod.component";

@Component({
  selector: 'app-domaine',
  templateUrl: './domaine.component.html',
  styleUrl: './domaine.component.scss'
})
export class DomaineComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie: number;

  ficheTechniques?: MatTableDataSource<FicheTechniques>;
  displayedColumns: string[] = ['client_nom', 'date_creation', 'categorie_produit', 'statut.libelle', 'actions'];
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
    this.ficheTechniques = new MatTableDataSource<FicheTechniques>([]);
  }

  ngAfterViewInit(): void {
    this.ficheTechniques.paginator = this.paginator;
    this.ficheTechniques.sort = this.sort;
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
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    this.ficheTechniquesService.getFicheTechniques().subscribe((response: FicheTechniques[]) => {
      this.ficheTechniques.data = response.filter(f => f.categorie_produit === this.fixeCategorie);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ficheTechniques.filter = filterValue.trim().toLowerCase();
  }

  crud(ficheTechnique: FicheTechniques, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    const fixeCategorie = this.fixeCategorie;
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {ficheTechnique, fixeCategorie, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(DomaineCrudComponent, dialogConfig);
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

  }

  checher() {

  }

  getCategorie(id: number) {
    return this.categories?.find(cat => cat.id === id).libelle;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id).libelle;
  }

  onSetAvis(ficheTechnique: FicheTechniques, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {ficheTechnique, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(AvisEtuteTechniqueDialodComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

}
