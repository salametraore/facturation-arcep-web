import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { FicheTechniquesService } from "../../../../shared/services/fiche-techniques.service";
import { CategorieProduit } from "../../../../shared/models/categorie-produit";
import { CategorieProduitService } from "../../../../shared/services/categorie-produit.service";
import { ProduitService } from "../../../../shared/services/produits.service";
import { Produit } from "../../../../shared/models/produit";
import { FicheTechniques } from "../../../../shared/models/ficheTechniques";
import { StatutFicheTechnique } from "../../../../shared/models/statut-fiche-technique";
import { StatutFicheTechniqueService } from "../../../../shared/services/statut-fiche-technique.service";
import { Client } from "../../../../shared/models/client";
import { ClientService } from "../../../../shared/services/client.service";
import { MatSort } from "@angular/material/sort";
import { operations } from "../../../../constantes";
import { RecouvDashboardClient } from "../../../../shared/models/recouv-dashboard-client";
import { AuthService } from "../../../../authentication/auth.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'client-details-fiches-techniques',
  templateUrl: './client-details-fiches-techniques.html'
})
export class ClientDetailsFichesTechniques implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['id','objet', 'date_creation', 'categorie_produit', 'statut.libelle'];

  selection = new SelectionModel<FicheTechniques>(true, []);
  ficheTechniques?: FicheTechniques[];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


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


  t_FicheTechniques?: MatTableDataSource<FicheTechniques>;

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
  ) {
    // Initialisation de la datasource
    this.t_FicheTechniques = new MatTableDataSource<FicheTechniques>([]);
  }

  ngOnInit(): void {

    this.reloadData();

  }

  ngAfterViewInit() {
    this.t_FicheTechniques.paginator = this.paginator;
    this.t_FicheTechniques.sort = this.sort;
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

    this.ficheTechniquesService
      .getListeFichesTechniquesByClientId(this.clientId)
      .subscribe((ligneFicheTechniques: FicheTechniques[]) => {
        console.log(ligneFicheTechniques);

        // 🔽 tri décroissant sur l'id
        const sorted = [...ligneFicheTechniques].sort(
          (a, b) => (b.id ?? 0) - (a.id ?? 0)
        );

        this.ficheTechniques = sorted;
        this.t_FicheTechniques.data = this.ficheTechniques;
      });

  }

  getCategorie(id: number) {
    return this.categories?.find(cat => cat.id === id)?.libelle;
  }

  onGetClient(item: Client) {
    this.client = item;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id)?.libelle;
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

  public refreshFromParent(): void {
    this.reloadData();
  }


}
