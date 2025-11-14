import {AfterViewInit, Component, Optional, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {Facture} from "../../../shared/models/facture";
import {Client} from "../../../shared/models/client";
import {RecouvDashboardClient} from "../../../shared/models/recouv-dashboard-client";
import {ClientService} from "../../../shared/services/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import {Utilisateur} from "../../../shared/models/utilisateur";
import {AuthService} from "../../../authentication/auth.service";
import {Role, UtilisateurRole} from "../../../shared/models/droits-utilisateur";
import {FicheTechniques} from "../../../shared/models/ficheTechniques";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {date_converte, operations} from "../../../constantes";
import {ClientDetailsFichesTechniques} from "./client-details-fiches-techniques/client-details-fiches-techniques";
import {ClientCrudServiceConfianceComponent} from "./client-crud-service-confiance/client-crud-service-confiance.component";
import {ClientCrudDomaineComponent} from "./client-crud-domaine/client-crud-domaine.component";

@Component({
  selector: 'client-details',
  templateUrl: './client-details.component.html'
})
export class ClientDetailsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'numeroFacture', 'libelle', 'echeance', 'montant', 'resteDu', 'penalites', 'statut'];

  selection = new SelectionModel<Facture>(true, []);

  public operations = operations;

  client: Client;
  nomClient: string;
  clientId : number;
  fixeCategorie: number=9;

  detailFicheClient?: RecouvDashboardClient;
  t_Factures: MatTableDataSource<Facture> = new MatTableDataSource<Facture>([]);
  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;

  @ViewChild(ClientDetailsFichesTechniques)
  ficheTechniquesChild?: ClientDetailsFichesTechniques;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private authService:AuthService,
    public dialog: MatDialog,
    public dialogService: DialogService,
  ) {  }

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {

  }

  ngOnInit(): void {

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();


    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      if (id) {

        this.clientId = id;

        this.clientService.getItem(id).subscribe(client => {
          this.client = client;
        });

      }

    });

    console.log("role utilisateur Connecte");
    console.log(this.roleUtilisateurConnecte);
  }

  private reloadData(): void {
    if (this.ficheTechniquesChild) {
      this.ficheTechniquesChild.refreshFromParent();
    }
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.t_Factures.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.t_Factures.data.forEach(row => this.selection.select(row));
    }
  }

  onFerme() {

  }

  onRetour() {
    this.router.navigate(
      ['/facture/client-direction-technique'],
    );
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



  test() {

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

