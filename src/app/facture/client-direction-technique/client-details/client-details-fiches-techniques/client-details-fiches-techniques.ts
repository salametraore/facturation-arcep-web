import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { FicheTechniquesService } from "../../../../shared/services/fiche-techniques.service";
import { CategorieProduit } from "../../../../shared/models/categorie-produit";
import { CategorieProduitService } from "../../../../shared/services/categorie-produit.service";
import { ProduitService } from "../../../../shared/services/produits.service";
import { Produit } from "../../../../shared/models/produit";
import {FicheTechniques, MiseAJourStatutFiche} from "../../../../shared/models/ficheTechniques";
import { StatutFicheTechnique } from "../../../../shared/models/statut-fiche-technique";
import { StatutFicheTechniqueService } from "../../../../shared/services/statut-fiche-technique.service";
import { Client } from "../../../../shared/models/client";
import { ClientService } from "../../../../shared/services/client.service";
import { MatSort } from "@angular/material/sort";
import { operations } from "../../../../constantes";
import { AuthService } from "../../../../authentication/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RetraitAutorisationDialogComponent} from "../../../retrait-autorisation-dialog/retrait-autorisation-dialog.component";
import {AvisEtuteTechniqueDialogComponent} from "../../../avis-etute-technique-dialog/avis-etute-technique-dialog.component";
import {Utilisateur} from "../../../../shared/models/utilisateur";
import {UtilisateurRole,Role} from "../../../../shared/models/droits-utilisateur";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {ClientCrudDomaineComponent} from "../client-crud-domaine/client-crud-domaine.component";
import {ClientCrudServiceConfianceComponent} from "../client-crud-service-confiance/client-crud-service-confiance.component";



@Component({
  selector: 'client-details-fiches-techniques',
  templateUrl: './client-details-fiches-techniques.html'
})
export class ClientDetailsFichesTechniques implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['id','objet', 'date_creation', 'categorie_produit', 'statut.libelle','actions' ];

  selection = new SelectionModel<FicheTechniques>(true, []);
  ficheTechniques?: FicheTechniques[];
  fixeCategorie: number;

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

  public operations = operations;

  t_FicheTechniques?: MatTableDataSource<FicheTechniques>;

  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;

  produitsAgrementEquipements = [72, 73, 74];
  produitsAgrementInstallateurs = [75];
  produitsAutorisationGenerale = [76];

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private authService:AuthService,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    // Initialisation de la datasource
    this.t_FicheTechniques = new MatTableDataSource<FicheTechniques>([]);
  }

  ngOnInit(): void {

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();
    console.log(this.utilisateurConnecte);


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

  onDelete(ficheTechniques: FicheTechniques) {
    console.log("fiche a supprimer ");
    console.log(ficheTechniques);
    this.dialogService
      .yes_no({ message: "Voulez-vous supprimer cet enregistrement ?" })
      .subscribe(yes_no => {
        if (yes_no === true) {

          // ✅ Vérification du statut avant suppression
          if (ficheTechniques.statut  && ficheTechniques.statut.id !== 1) {
            this.dialogService.alert({
              message: "Impossible de supprimer cette fiche car elle n'est plus à l'étape initiale."
            });
            return; // on sort sans appeler le delete
          }

          // ✅ Statut OK → on peut supprimer
          this.ficheTechniquesService
            .delete(ficheTechniques.id)
            .subscribe(
              () => {
                this.msgMessageService.success('Supprimé avec succès');
                this.reloadData();
              },
              (error) => {
                console.log(error);
                this.dialogService.alert({ message: error.message });
              }
            );
        }
      });
  }

  onModifierFicheTechnique(ficheTechnique: FicheTechniques) {
          console.log("ficheTechnique");
          console.log(ficheTechnique);

          if (ficheTechnique.categorie_produit===8) {
              this.crudNumerotation(ficheTechnique,this.operations.update);
          }
          else if (ficheTechnique.categorie_produit===9) {
              this.crudNomDomaine(ficheTechnique,this.operations.update);
          }
          else if (ficheTechnique.categorie_produit===10) {
              this.crudServiceConfiance(ficheTechnique,this.operations.update);
          }
          else if (ficheTechnique.categorie_produit===11) {
              this.crudServicesAValeurAjoutee(ficheTechnique,this.operations.update);
          }
          else if (ficheTechnique.categorie_produit===12) {

            const produitsIds: number[] =
                ficheTechnique?.produits_detail
                  ?.map(p => Number(p.produit))   // au cas où ce soit string
                  .filter(id => !isNaN(id))       // garde uniquement des nombres
                || [];

            console.log(ficheTechnique?.produits_detail);
            console.log("produitsIds");
            console.log(produitsIds);

            if (produitsIds.length > 0) {

              if (produitsIds.some(id => this.produitsAutorisationGenerale.includes(id))) {
                  this.crudAutorisationGenerale(ficheTechnique,this.operations.update);
              }
              else if (produitsIds.some(id => this.produitsAgrementInstallateurs.includes(id))) {
                  this.crudAgrementInstallateurs(ficheTechnique,this.operations.update);
              }
              else if (produitsIds.some(id => this.produitsAgrementEquipements.includes(id))) {
                  this.crudAgrementEquipements(ficheTechnique,this.operations.update);
              }

            }

          }
          else if (ficheTechnique.categorie_produit===13) {

          }
          else if (ficheTechnique.categorie_produit===14) {
              this.crudPrestationsDiverses(ficheTechnique,this.operations.update);
          }
  }

  onTransmettre(ficheTechniques: FicheTechniques) {
    this.dialogService
      .yes_no({ message: "Voulez-vous transmettre cette fiche pour traitement ?" })
      .subscribe(yes_no => {
        if (yes_no === true) {

          // ✅ Vérification du statut avant transmission
          // (ex : on ne transmet que si la fiche est à l’étape initiale id = 1)
          if (!ficheTechniques.statut || ficheTechniques.statut.id !== 1) {
            this.dialogService.alert({
              message: "Impossible de transmettre cette fiche car elle n'est plus à l'étape initiale."
            });
            return; // on sort sans appeler le service
          }

          const miseAJourStatutFiche: MiseAJourStatutFiche = new MiseAJourStatutFiche();
          miseAJourStatutFiche.fiche_technique = ficheTechniques.id;
          miseAJourStatutFiche.statut = 2; // statut 'transmise'

          this.ficheTechniquesService
            .setStatutFiche(miseAJourStatutFiche)
            .subscribe(
              (response: MiseAJourStatutFiche) => {
                this.msgMessageService.success("Fiche transmise avec succès !");
                this.reloadData(); // comme pour la suppression
              },
              (error) => {
                this.dialogService.alert({ message: error.message });
              }
            );
        }
      });
  }

  onSetAvis(ficheTechnique: FicheTechniques, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {ficheTechnique, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(AvisEtuteTechniqueDialogComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {
    });
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

  hasOperationCode( opCode: string): boolean {
    const  user=this.roleUtilisateurConnecte;

    if (!user || !opCode) return false;

    const needle = opCode.trim().toLowerCase();

    // Normaliser: accepter user.role = Role | Role[]
    const roles: Role[] = Array.isArray((user as any).role)
      ? (user as any).role
      : (user as any).role
        ? [ (user as any).role ]
        : [];

    for (const role of roles) {
      for (const op of (role?.operations ?? [])) {
        if ((op.code ?? '').trim().toLowerCase() === needle) return true;
      }
    }
    return false;
  }

  getProduitsLibelles(fiche: FicheTechniques | null | undefined): string {
    if (!fiche || !fiche.produits_detail || fiche.produits_detail.length === 0) {
      return '';
    }

    return fiche.produits_detail
      .map(p => p.produit_libelle)
      .filter((lib): lib is string => !!lib && lib.trim().length > 0)
      .join(', ');
  }



  crudNomDomaine(ficheTechnique: FicheTechniques, operation?: string) {

    const dialogConfig = new MatDialogConfig();
    const fixeCategorie = this.fixeCategorie;
    const clientId=this.clientId;

    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {clientId,ficheTechnique, fixeCategorie, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(ClientCrudDomaineComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }


  crudServiceConfiance(ficheTechnique: FicheTechniques, operation?: string) {

    const dialogConfig = new MatDialogConfig();
    const fixeCategorie = 10;
    const clientId=this.clientId;

    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {clientId,ficheTechnique, fixeCategorie, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(ClientCrudServiceConfianceComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }


  crudPrestationsDiverses(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 14;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-prestations-diverses', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }

  crudServicesAValeurAjoutee(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 11;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-service-a-valeur-ajoute', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }


  crudNumerotation(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 8;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-numerotation', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }


  crudAutorisationGenerale(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 12;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-autorisation-generale', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }

  crudAgrementEquipements(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 12;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-agrement-equipement', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }

  crudAgrementInstallateurs(ficheTechnique?: FicheTechniques, operation: string = this.operations.create) {

    const cat = 12;                 // catégorie Prestations diverses
    const ficheId = ficheTechnique?.id; // si tu appelles en mode update

    this.router.navigate(
      ['/facture/client-crud-agrement-installeur', this.clientId],
      {
        queryParams: {
          op: operation,   // create / update / transmettre ...
          cat: cat,        // fixeCategorie
          ficheId: ficheId // éventuel id de la fiche
        }
      }
    );
  }


}
