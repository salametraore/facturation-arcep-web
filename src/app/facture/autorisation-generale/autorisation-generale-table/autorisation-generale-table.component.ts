import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FicheTechniques} from "../../../shared/models/ficheTechniques";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {Client} from "../../../shared/models/client";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import { operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {StatutFicheTechnique} from "../../../shared/models/statut-fiche-technique";
import {StatutFicheTechniqueService} from "../../../shared/services/statut-fiche-technique.service";
import {AvisEtuteTechniqueDialodComponent} from "../../avis-etute-technique-dialod/avis-etute-technique-dialod.component";
import {RetraitAutorisationDialogComponent} from "../../retrait-autorisation-dialog/retrait-autorisation-dialog.component";
import {Role, UtilisateurRole} from "../../../shared/models/droits-utilisateur";
import {AuthService} from "../../../authentication/auth.service";
import {Utilisateur} from "../../../shared/models/utilisateur";

interface FTListFilter {
  clientText?: string;   // texte saisi dans "Nom du client"
  startDate?: string;    // YYYY-MM-DD (inclusif)
  endDate?: string;      // YYYY-MM-DD (inclusif)
  serviceId?: number;    // id produit/service (ligne ou dans produits_detail)
  statusId?: number;     // id du statut
}


@Component({
  selector: 'autorisation-generale-table',
  templateUrl: './autorisation-generale-table.component.html',
  styleUrl: './autorisation-generale-table.component.scss'
})
export class AutorisationGeneraleTableComponent implements OnInit, AfterViewInit {

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
  client: Client;
  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;

  private filterValues: FTListFilter = {};

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

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();
    console.log(this.utilisateurConnecte);

    this.ficheTechniques.filterPredicate = (row: FicheTechniques, raw: string) => {
      if (!raw) return true;
      let f: FTListFilter;
      try { f = JSON.parse(raw); } catch { return true; }

      // 1) Client (texte sur client_nom)
      if (f.clientText) {
        const needle = f.clientText.trim().toLowerCase();
        if (!(row.client_nom ?? '').toLowerCase().includes(needle)) return false;
      }

      // 2) Service/Produit
      //   - si la ligne porte un champ produit / produit_id, on compare
      //   - sinon, on cherche dans produits_detail[] (si présent)
      if (f.serviceId != null) {
        const topLevelProduit = (row as any).produit ?? (row as any).produit_id ?? null;
        const okTop = topLevelProduit != null ? Number(topLevelProduit) === Number(f.serviceId) : false;
        const okDetail = row.produits_detail?.some(pd => Number(pd?.produit) === Number(f.serviceId)) ?? false;
        if (!(okTop || okDetail)) return false;
      }

      // 3) Statut par id
      if (f.statusId != null) {
        if ((row.statut?.id ?? null) !== f.statusId) return false;
      }

      // 4) Intervalle de dates (inclusif) sur date_creation
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
      this.produits = produits.filter(f => f.id === 76);
    });

    this.ficheTechniquesService.getFicheTechniques().subscribe((lignes: FicheTechniques[]) => {
      const allowed = new Set<number>([76]);
      this.ficheTechniques.data = lignes
        .filter(f =>
          f.categorie_produit === this.fixeCategorie &&
          f.produits_detail?.some(p => p && allowed.has(p.produit))
        )
        .sort((a, b) => b.id - a.id);  // Tri décroissant

      this.ficheTechniques.filter = JSON.stringify(this.filterValues || {});
      if (this.ficheTechniques.paginator) this.ficheTechniques.paginator.firstPage();
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

  onGetClient(item: Client) {
    this.client = item;
    this.chercher();
  }

  private dayStart(ts: any): number | null {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  chercher() {
    this.filterValues = {
      clientText: (this.nomClient ?? '').trim() || undefined,
      startDate:  this.startDate ? new Date(this.startDate).toISOString().slice(0, 10) : undefined,
      endDate:    this.endDate   ? new Date(this.endDate).toISOString().slice(0, 10)   : undefined,
      serviceId:  this.serviceFilter || undefined,
      statusId:   this.statusFilter || undefined,
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

}

