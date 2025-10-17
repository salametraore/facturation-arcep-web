import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FicheTechniques} from "../../../shared/models/ficheTechniques";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {StatutFicheTechnique} from "../../../shared/models/statut-fiche-technique";
import {Client} from "../../../shared/models/client";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../../shared/services/statut-fiche-technique.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {operations} from "../../../constantes";
import {AvisEtuteTechniqueDialodComponent} from "../../avis-etute-technique-dialod/avis-etute-technique-dialod.component";
import {RetraitAutorisationDialogComponent} from "../../retrait-autorisation-dialog/retrait-autorisation-dialog.component";

@Component({
  selector: 'agrement-installeur-table',
  templateUrl: './agrement-installeur-table.component.html',
  styleUrl: './agrement-installeur-table.component.scss'
})
export class AgrementInstalleurTableComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie: number;

  @Output() notifyFicheTechnique: EventEmitter<FicheTechniques> = new EventEmitter<FicheTechniques>();
  @Output() notifyActionOperation: EventEmitter<string> = new EventEmitter<string>();

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

/*    this.ficheTechniquesService.getFicheTechniques().subscribe((response: FicheTechniques[]) => {
        this.ficheTechniques.data = response.filter(f => f.categorie_produit === this.fixeCategorie);
      });*/

    this.ficheTechniquesService.getFicheTechniques()
      .subscribe((lignes: FicheTechniques[]) => {
        const allowed = new Set<number>([75]); // productAllowedIds
        this.ficheTechniques.data = lignes.filter(f =>
          f.categorie_produit === this.fixeCategorie &&
          (
            (f.produits_detail?.some(p => p && allowed.has(p.produit)))
          )
        );
      });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ficheTechniques.filter = filterValue.trim().toLowerCase();
  }

  crud(ficheTechnique: FicheTechniques, operation?: string) {
    this.notifyFicheTechnique.emit(ficheTechnique);
    this.notifyActionOperation.emit(operation);
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

  onRetraitAutorisation(ficheTechnique: FicheTechniques, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {ficheTechnique, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(RetraitAutorisationDialogComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {
    });
  }

}
