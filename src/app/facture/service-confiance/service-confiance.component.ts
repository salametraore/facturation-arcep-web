import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations} from "../../constantes";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {DomaineCrudComponent} from "../domaine/domaine-crud/domaine-crud.component";
import {ServiceConfianceCrudComponent} from "./service-confiance-crud/service-confiance-crud.component";
import {AvisEtuteTechniqueDialogComponent} from "../avis-etute-technique-dialog/avis-etute-technique-dialog.component";
import {RetraitAutorisationDialogComponent} from "../retrait-autorisation-dialog/retrait-autorisation-dialog.component";
import {Role, UtilisateurRole} from "../../shared/models/droits-utilisateur";
import {Utilisateur} from "../../shared/models/utilisateur";
import {AuthService} from "../../authentication/auth.service";

interface SCSearchCriteria {
  clientText?: string;    // nom du client (saisi dans l'input)
  startDate?: string;     // "YYYY-MM-DD"
  endDate?: string;       // "YYYY-MM-DD"
  serviceId?: number;     // id produit/service sélectionné
  statusId?: number;      // id statut sélectionné
}

@Component({
  selector: 'app-service-confiance',
  templateUrl: './service-confiance.component.html'
})
export class ServiceConfianceComponent implements OnInit, AfterViewInit {

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
  categoriesFiltered: CategorieProduit[];
  produits: Produit[];
  statutFicheTechniques: StatutFicheTechnique[];
  clients: Client[];
  client: Client;

  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;

  private filterValues: SCSearchCriteria = {};

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private authService:AuthService,
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
    this.fixeCategorie = 10;

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();
    console.log(this.utilisateurConnecte);

    // Predicate de filtre multi-critères
    this.ficheTechniques.filterPredicate = (row: FicheTechniques, raw: string) => {
      if (!raw) return true;
      let f: SCSearchCriteria;
      try { f = JSON.parse(raw); } catch { return true; }

      // 1) Client (par texte saisi, sur le libellé)
      if (f.clientText) {
        const needle = f.clientText.trim().toLowerCase();
        const lib = (row.client_nom ?? '').toLowerCase();
        if (!lib.includes(needle)) return false;
      }

      // 2) Service/Produit (adapte si ton champ diffère)
/*
      if (f.serviceId != null) {
        const produitId = (row as any).produit ?? (row as any).produit_id ?? null;
        if (produitId !== f.serviceId) return false;
      }
*/

      if (f.serviceId != null) {
        const topLevelProduit = (row as any).produit ?? (row as any).produit_id ?? null;
        const okTop = topLevelProduit != null ? Number(topLevelProduit) === Number(f.serviceId) : false;
        const okDetail = row.produits_detail?.some(pd => Number(pd?.produit) === Number(f.serviceId)) ?? false;
        if (!(okTop || okDetail)) return false;
      }

      // 3) Statut (par id)
      if (f.statusId != null) {
        if ((row.statut?.id ?? null) !== f.statusId) return false;
      }

      // 4) Dates (intervalle inclusif)
      const rowT = this.dayStart(row.date_creation);
      if (rowT == null) return false;

      if (f.startDate) {
        const t0 = this.dayStart(f.startDate);
        if (t0 != null && rowT < t0) return false;
      }
      if (f.endDate) {
        const t1 = this.dayStart(f.endDate);
        if (t1 != null && rowT > t1) return false;
      }

      return true;
    };

  }

  private dayStart(ts: any): number | null {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
      this.categoriesFiltered=categories.filter(f => f.id === this.fixeCategorie);
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
      this.ficheTechniques.data = response
        .filter(f => f.categorie_produit === this.fixeCategorie)
        .sort((a, b) => b.id - a.id);

      // Réapplique le filtre courant après rechargement
      this.ficheTechniques.filter = JSON.stringify(this.filterValues);
      if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
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
    let ref = this.dialog.open(ServiceConfianceCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(ficheTechniques: FicheTechniques) {
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

  chercher() {
    this.filterValues = {
      clientText: (this.nomClient ?? '').trim() || undefined,
      startDate: this.startDate ? new Date(this.startDate).toISOString().slice(0, 10) : undefined,
      endDate:   this.endDate   ? new Date(this.endDate).toISOString().slice(0, 10)   : undefined,
      serviceId: this.serviceFilter || undefined,
      statusId:  this.statusFilter || undefined,
    };
    this.ficheTechniques.filter = JSON.stringify(this.filterValues);
    if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
  }

  reset() {
    this.nomClient = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.serviceFilter = undefined;
    this.statusFilter = undefined;

    this.filterValues = {};
    this.ficheTechniques.filter = JSON.stringify(this.filterValues);
    if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
  }

  getCategorie(id: number) {
    return this.categories?.find(cat => cat.id === id).libelle;
  }

  getStatut(id: number) {
    return this.statutFicheTechniques?.find(st => st.id === id).libelle;
  }

  onGetClient(item: Client) {
    this.client = item;
    this.chercher();
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

}
