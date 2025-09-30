import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {
  ServiceConfianceCrudComponent
} from "../../parametre/service-confiance/service-confiance-crud/service-confiance-crud.component";
import {DomaineCrudComponent} from "../../parametre/domaine/domaine-crud/domaine-crud.component";
import {operations} from "../../constantes";
import {Direction} from "../../shared/models/direction";
import {DirectionService} from "../../shared/services/direction.service";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {ElementsFactureRecuCrudComponent} from "./elements-facture-recu-crud/elements-facture-recu-crud.component";
import {ElementFacturationRecuCreeList} from "../../shared/models/element-facturation-recu-cree-list";
import {FicheTechniqueAFacturer} from "../../shared/models/fiche-technique-a-facturer";

@Component({
  selector: 'app-elements-facture-recu',
  templateUrl: './elements-facture-recu.component.html',
  styleUrl: './elements-facture-recu.component.scss'
})
export class ElementsFactureRecuComponent  implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;

  t_ElementFacturationRecuCreeList?: MatTableDataSource<ElementFacturationRecuCreeList>;
  displayedColumns: string[] = ['client', 'date_soumission','categorie_produit_id','type_frais', 'actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient:any;
  startDate :any;
  endDate :any;
  serviceFilter :any;
  directionFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  produits:Produit[];
  directions:Direction[];
  direction:Direction;
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
    public directionService: DirectionService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_ElementFacturationRecuCreeList = new MatTableDataSource<ElementFacturationRecuCreeList>([]);
  }

  ngAfterViewInit(): void {
    this.t_ElementFacturationRecuCreeList.paginator = this.paginator;
    this.t_ElementFacturationRecuCreeList.sort = this.sort;
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
    this.directionService.getListItems().subscribe((directions: Direction[]) => {
      this.directions = directions;
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.ficheTechniquesService.getElementFacturationRecus().subscribe((elementFacturationRecuCreeLists: ElementFacturationRecuCreeList[]) => {
      this.t_ElementFacturationRecuCreeList.data = elementFacturationRecuCreeLists;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_ElementFacturationRecuCreeList.filter = filterValue.trim().toLowerCase();
  }

  crud(elementFacturation: ElementFacturationRecuCreeList, operation?: string) {
    if(elementFacturation){
      this.ficheTechniquesService.getElementFacturationRecu(elementFacturation.element_facturation_recu_id).subscribe((ficheTechniqueAFacturer: FicheTechniqueAFacturer) => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '1024px';
        dialogConfig.autoFocus = true;
        dialogConfig.data = {ficheTechniqueAFacturer,operation};
        dialogConfig.disableClose = true;
        let ref = this.dialog.open(ElementsFactureRecuCrudComponent, dialogConfig);
        ref.afterClosed().subscribe(() => {
          this.reloadData();
        }, error => {

        });
      });
    }else{
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '1024px';
      dialogConfig.autoFocus = true;
      dialogConfig.data = { operation};
      dialogConfig.disableClose = true;
      let ref = this.dialog.open(ElementsFactureRecuCrudComponent, dialogConfig);
      ref.afterClosed().subscribe(() => {
        this.reloadData();
      }, error => {

      });
    }
  }

  onDelete(elementFacturation: ElementFacturationRecuCreeList) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        // this.ficheTechniquesService
        //   .delete(elementFacturation.element_facturation_recu_id)
        //   .subscribe(
        //     (data) => {
        //       this.msgMessageService.success('Supprimé avec succès');
        //       this.reloadData();
        //     },
        //     (error => {
        //       this.dialogService.alert({message: error});
        //     })
        //   );
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
    return this.categories?.find(cat=>cat.id===id).libelle;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id).libelle;
  }

  onGetDirection(item: Direction) {
    this.direction = item;
  }
}
