import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ChercheFiche, FicheTechniques} from "../../shared/models/ficheTechniques";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {date_converte, operations} from "../../constantes";
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
import {RetraitAutorisationDialogComponent} from "../retrait-autorisation-dialog/retrait-autorisation-dialog.component";
import {Role, UtilisateurRole} from "../../shared/models/droits-utilisateur";
import {Utilisateur} from "../../shared/models/utilisateur";
import {AuthService} from "../../authentication/auth.service";

interface FTSearchCriteria {
  text?: string;          // filtre texte global (optionnel, si tu veux en ajouter un)
  clientId?: number;      // id du client choisi
  startDate?: string;     // ISO yyyy-mm-dd
  endDate?: string;       // ISO yyyy-mm-dd
  serviceId?: number;     // id du produit/service
  statusId?: number;      // id du statut
}

@Component({
  selector: 'app-domaine',
  templateUrl: './domaine.component.html'
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
  categoriesFiltered: CategorieProduit[];
  produits: Produit[];
  statutFicheTechniques: StatutFicheTechnique[];
  clients: Client[];
  client: Client;
  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;

  private filterValues: FTSearchCriteria = {};


  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    private authService:AuthService,
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

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();
    console.log(this.utilisateurConnecte);

    // ⬇️ Predicate de filtre multi-champs
    this.ficheTechniques.filterPredicate = (row: FicheTechniques, filter: string) => {
      if (!filter) return true;
      let f: FTSearchCriteria;
      try { f = JSON.parse(filter); } catch { return true; }

      // TEXTE global (si tu ajoutes un input text global)
      if (f.text) {
        const t = f.text.toLowerCase();
        const inText =
          (row.client_nom || '').toLowerCase().includes(t) ||
          (this.getCategorie(row.categorie_produit) || '').toLowerCase().includes(t) ||
          (row.statut?.libelle || '').toLowerCase().includes(t);
        if (!inText) return false;
      }

      // Client (si tu veux filtrer par id exact)
      if (f.clientId && row.client !== f.clientId) return false;

      // Service/Produit (adapte selon ton modèle: produit, produit_id, service_id…)
/*
      if (f.serviceId) {
        const produitId = (row as any).produit ?? (row as any).produit_id ?? (row as any).service_id;
        if (produitId !== f.serviceId) return false;
      }
*/

      if (f.serviceId != null) {
        const topLevelProduit = (row as any).produit ?? (row as any).produit_id ?? null;
        const okTop = topLevelProduit != null ? Number(topLevelProduit) === Number(f.serviceId) : false;
        const okDetail = row.produits_detail?.some(pd => Number(pd?.produit) === Number(f.serviceId)) ?? false;
        if (!(okTop || okDetail)) return false;
      }

      // Statut
      if (f.statusId && row.statut?.id !== f.statusId) return false;

      // Dates (row.date_creation doit être une date parsable)
      if (f.startDate) {
        const rowTime = this.toDayStart(new Date(row.date_creation));
        const startTime = this.toDayStart(new Date(f.startDate));
        if (rowTime < startTime) return false;
      }
      if (f.endDate) {
        const rowTime = this.toDayStart(new Date(row.date_creation));
        const endTime = this.toDayStart(new Date(f.endDate));
        if (rowTime > endTime) return false;
      }

      return true;
    };
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
      console.log(response);
      this.ficheTechniques.data = response
        .filter(f => f.categorie_produit === this.fixeCategorie)
        .sort((a, b) => b.id - a.id);

      // ⬇️ Ré-applique le filtre courant après rechargement
      if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
      this.ficheTechniques.filter = JSON.stringify(this.filterValues || {});
    });
  }

  applyFilter(event: Event) {
    const text = (event.target as HTMLInputElement).value?.trim().toLowerCase() || '';
    this.filterValues = { ...this.filterValues, text };
    this.ficheTechniques.filter = JSON.stringify(this.filterValues);
    if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
  }

  private toDayStart(d: Date): number {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
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

  cherche() {
    this.filterValues = {
      ...this.filterValues,
      clientId: this.client?.id || undefined,
      startDate: this.startDate ? new Date(this.startDate).toISOString().slice(0, 10) : undefined,
      endDate: this.endDate ? new Date(this.endDate).toISOString().slice(0, 10) : undefined,
      serviceId: this.serviceFilter || undefined,
      statusId: this.statusFilter || undefined,
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
    this.client = undefined;

    this.filterValues = {};
    this.ficheTechniques.filter = JSON.stringify(this.filterValues);
    if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
  }

  onGetClient(item: Client) {
    this.client = item;
    this.cherche();
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
