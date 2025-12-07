import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
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
import {operations, TYPE_FRAIS} from "../../constantes";
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
  templateUrl: './elements-facture-recu.component.html'
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
  //serviceFilter :any;
  directionFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  filteredCategories: CategorieProduit[] = [];
  produits:Produit[];
  directions:Direction[];
  direction:Direction;
  statutFicheTechniques: StatutFicheTechnique[];
  clients: Client[];
  TYPE_FRAIS = TYPE_FRAIS;
  serviceFilter: number | null = null;
  private textFilter = '';

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

    this.t_ElementFacturationRecuCreeList.filterPredicate =
      (data: ElementFacturationRecuCreeList, raw: string) => {
        const f = raw ? JSON.parse(raw) : {};
        const byCategorie =
          !f.categorie || data.categorie_produit_id === f.categorie;

        const txt = (f.text || '').toString();
        const byText =
          !txt ||
          (data.client?.toLowerCase().includes(txt)) ||
          (this.getCategorie(data.categorie_produit_id)?.toLowerCase().includes(txt));

        return byCategorie && byText;
      };
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
      // Si des produits sont déjà chargés (cas particulier), recalcule:
      this.computeFilteredCategories();
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      //this.produits = produits.filter(f=>f.categorieProduit===this.fixeCategorie);
      ///this.produits = produits;
      // Optionnel: si tu veux afficher des produits tant qu’aucune direction n’est choisie
      this.produits = produits;
     // this.computeFilteredCategories();
    });

    this.directionService.getListItems().subscribe((directions: Direction[]) => {
      this.directions = directions.filter(d => d.id !== 0);
    })

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.ficheTechniquesService.getElementFacturationRecus()
      .subscribe((elementFacturationRecuCreeLists: ElementFacturationRecuCreeList[]) => {
        console.log("elementFacturationRecuCreeLists");
        console.log(elementFacturationRecuCreeLists);
        this.t_ElementFacturationRecuCreeList.data = elementFacturationRecuCreeLists
          .sort((a, b) => b.id - a.id); //
        this.updateDataSourceFilter();
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_ElementFacturationRecuCreeList.filter = filterValue.trim().toLowerCase();
    this.updateDataSourceFilter();
  }

  /** Appelée quand la direction change */
  onDirectionChange(directionId: number | null) {
    this.directionFilter = directionId;
    if (!directionId) {
      this.produits = [];
      this.filteredCategories = [];
      this.serviceFilter = null;
      return;
    }

    this.produitService.getListeProduitsByDirection(directionId).subscribe({
      next: (produits) => {
        this.produits = Array.isArray(produits) ? produits : [];
        this.computeFilteredCategories();
        if (!this.produits.some(p => p.id === this.serviceFilter)) {
          this.serviceFilter = null;
        }
      },
      error: () => {
        this.msgMessageService.errorLoading('Impossible de charger les produits de la direction sélectionnée.');
        this.produits = [];
        this.filteredCategories = [];
        this.serviceFilter = null;
      }
    });

    this.direction = this.directions.find(d => d.id === directionId);
  }

  /** Garde uniquement les catégories utilisées par les produits courants */
  private computeFilteredCategories() {
    if (!this.categories?.length || !this.produits?.length) {
      this.filteredCategories = [];
      return;
    }
    const ids = new Set(this.produits.map(p => p.categorieProduit));
    this.filteredCategories = this.categories.filter(c => ids.has(c.id));
  }

  /** Quand la catégorie change */
  onCategorieChange(catId: number | null) {
    this.serviceFilter = catId ?? null;
    this.updateDataSourceFilter();
  }

  /** Applique le filtre composite à la dataSource */
  private updateDataSourceFilter() {
    const payload = {
      categorie: this.serviceFilter ?? null,
      text: this.textFilter || null,
    };
    this.t_ElementFacturationRecuCreeList!.filter = JSON.stringify(payload);
    // Revenir à la première page après filtrage
    this.t_ElementFacturationRecuCreeList!.paginator?.firstPage();
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

  chercher() {

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

  getTypeFrais(type_frais:string){
    return this.TYPE_FRAIS.find(t=>t.code===type_frais)?.label;
  }


}
