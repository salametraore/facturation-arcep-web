import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations} from "../../constantes";
import {EncaissementsService} from "../../shared/services/encaissements.service";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {ModePaiement} from "../../shared/models/mode-paiement";
import {ModePaiementService} from "../../shared/services/mode-paiement.service";
import {EncaissementCrudComponent} from "./encaissement-crud/encaissement-crud.component";
import {RecouvListeEncaissement} from "../../shared/models/recouv-liste-encaissement";
import {EncaissementDetail} from "../../shared/models/encaissementDetail";
import {Encaissement} from "../../shared/models/encaissement";
import {EncaissementDirectCrudComponent} from "../encaissement-direct/encaissement-direct-crud/encaissement-direct-crud.component";
import {Utilisateur} from "../../shared/models/utilisateur";
import {Role, UtilisateurRole} from "../../shared/models/droits-utilisateur";
import {AuthService} from "../../authentication/auth.service";
import {HttpResponse} from "@angular/common/http";
import {PdfViewService} from "../../shared/services/pdf-view.service";


type FilterState = {
  nomClient?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  modeId?: number | null;
};


@Component({
  selector: 'app-encaissement',
  templateUrl: './encaissement.component.html'
})
export class EncaissementComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;
  t_RecouvListeEncaissement?: MatTableDataSource<RecouvListeEncaissement>;

  displayedColumns = ['client', 'montant', 'affecte', 'solde_non_affecte','date_encaissement', 'mode_paiement', 'actions' ];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient:any;
  startDate :any;
  endDate :any;
  serviceFilter :any;
  modeFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  produits:Produit[];
  clients: Client[];
  modePaiements: ModePaiement[];

  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;



  constructor(
    private encaissementsService: EncaissementsService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private modePaiementService: ModePaiementService,
    private clientService: ClientService,
    private pdfViewService: PdfViewService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private authService:AuthService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_RecouvListeEncaissement = new MatTableDataSource<RecouvListeEncaissement>([]);
  }

  ngAfterViewInit(): void {
    this.t_RecouvListeEncaissement.paginator = this.paginator;
    this.t_RecouvListeEncaissement.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();
    console.log(this.utilisateurConnecte);

  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories= categories;
    });
    this.modePaiementService.getItems().subscribe((modePaiements: ModePaiement[]) => {
      this.modePaiements= modePaiements;
    });
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f=>f.categorieProduit===this.fixeCategorie);
    });
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.encaissementsService.getListencaissement().subscribe((response: RecouvListeEncaissement[]) => {
      this.t_RecouvListeEncaissement.data = response.sort((a, b) => b.encaissement_id - a.encaissement_id);
      console.log(response);
      this.setupFilterPredicate();
      this.chercher();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_RecouvListeEncaissement.filter = filterValue.trim().toLowerCase();
  }

  crud(encaissement: RecouvListeEncaissement, operation?: string) {
    if(encaissement){
      this.encaissementsService.getItem(encaissement?.encaissement_id).subscribe((encaissementDetail: EncaissementDetail) => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '1024px';
        dialogConfig.autoFocus = true;
        dialogConfig.data = {encaissementDetail, operation};
        dialogConfig.disableClose = true;
        let ref = this.dialog.open(EncaissementCrudComponent, dialogConfig);
        ref.afterClosed().subscribe(() => {
          this.reloadData();
        }, error => {

        });
      });
    }else{
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '1024px';
      dialogConfig.autoFocus = true;
      dialogConfig.data = {operation};
      dialogConfig.disableClose = true;
      let ref = this.dialog.open(EncaissementCrudComponent, dialogConfig);
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
    this.nomClient = '';
    this.startDate = null;
    this.endDate = null;
    this.modeFilter = null;

    this.t_RecouvListeEncaissement.filter = ''; // efface tout
    if (this.t_RecouvListeEncaissement.paginator) {
      this.t_RecouvListeEncaissement.paginator.firstPage();
    }
  }

  chercher() {
    const state: FilterState = {
      nomClient: this.nomClient || '',
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      modeId: this.modeFilter != null ? Number(this.modeFilter) : null
    };
    this.t_RecouvListeEncaissement.filter = JSON.stringify(state);
    this.t_RecouvListeEncaissement.paginator?.firstPage();
  }

  getCategorie(id:number){
    return this.categories?.find(cat=>cat.id===id).libelle;
  }


  private toDayStart(d?: string | Date | null): number | null {
    if (!d) return null;
    const x = new Date(d);
    if (isNaN(x as any)) return null;
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  }


  private toDayEnd(d?: string | Date | null): number | null {
    if (!d) return null;
    const x = new Date(d);
    if (isNaN(x as any)) return null;
    x.setHours(23, 59, 59, 999);
    return x.getTime();
  }


  private setupFilterPredicate() {
    (this.t_RecouvListeEncaissement.filterPredicate = (row: RecouvListeEncaissement, raw: string) => {
      if (!raw) return true;
      const f: FilterState = JSON.parse(raw || '{}');

        // 3.1 Nom client (contient)
        if (f.nomClient) {
          const needle = (f.nomClient || '').toString().trim().toLowerCase();
          const hay = (row.client || '').toString().trim().toLowerCase();
          if (!hay.includes(needle)) return false;
        }

        // 3.2 Dates (entre start & end inclus)
        if (f.startDate || f.endDate) {
          const rowT = new Date(row.date_encaissement).getTime();
          const minT = this.toDayStart(f.startDate);
          const maxT = this.toDayEnd(f.endDate);
          if (minT !== null && rowT < minT) return false;
          if (maxT !== null && rowT > maxT) return false;
        }

        // 3.3 Mode de paiement
      // ===== Filtre par ID de mode de paiement =====
      if (f.modeId != null) {
        const wantedId = Number(f.modeId);
        // utilitaire: renvoie un nombre valide ou null
        const num = (v: any) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        };

        // essaie plusieurs champs possibles et prends le 1er valide
        const rowModeId =
          num((row as any).mode_paiement_id) ??
            num((row as any).modePaiementId) ??
              num((row as any).mode_id);
        if (rowModeId === null || rowModeId !== wantedId) return false;
      }

      return true;
    });
  }


  openEncaissementDirect(): void {
    const dialogRef = this.dialog.open(EncaissementDirectCrudComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      data: {}
    });
    dialogRef.afterClosed().subscribe(() => {
      // rafraîchir si nécessaire
      this.chercher?.();
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


  onPrintRecu(encaissement: RecouvListeEncaissement) {
    this.encaissementsService.genererRecuPDF(encaissement?.encaissement_id)
      .subscribe({
        next: (arrayBuffer: ArrayBuffer) => {
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          this.pdfViewService.printDirectly(blob);
        },
        error: (err) => {
          this.dialogService.alert({ message: 'Erreur : ' + err.message });
        }
      });
  }


}

