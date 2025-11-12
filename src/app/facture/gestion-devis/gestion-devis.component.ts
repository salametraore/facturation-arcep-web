import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {Produit} from "../../shared/models/produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {ProduitService} from "../../shared/services/produits.service";
import {PdfViewService} from "../../shared/services/pdf-view.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {operations, TYPE_FRAIS, ETATS_FACTURE, ETATS_DEVIS} from "../../constantes";
import {GestionDevisCrudComponent} from "./gestion-devis-crud/gestion-devis-crud.component";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {Devis} from "../../shared/models/devis";
import {DevisService} from "../../shared/services/devis.service";
import {HttpResponse} from "@angular/common/http";

import { take, finalize } from 'rxjs/operators';



const NON_CANCELLABLE = new Set<string>(['PAYE', 'ANNULE']);


@Component({
  selector: 'gestion-devis',
  templateUrl: './gestion-devis.component.html'
})
export class GestionDevisComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;

  t_Devis?: MatTableDataSource<Devis>;
  displayedColumns: string[] = ['reference','client','montant', 'date','objet', 'etat','actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public operations = operations;
  selectedRow: any = undefined;
  nomClient:any;
  startDate :any;
  endDate :any;
  serviceFilter :any;
  statusFilter :any;
  categories:CategorieProduit[];
  produits:Produit[];

  clients: Client[];

  TYPE_FRAIS=TYPE_FRAIS;
  etatsDevis=ETATS_DEVIS;




  constructor(
    private devisService: DevisService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private pdfViewService: PdfViewService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_Devis = new MatTableDataSource<Devis>([]);
  }

  ngAfterViewInit(): void {
    this.t_Devis.paginator = this.paginator;
    this.t_Devis.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;

    // 🔎 Filtre multi-critères
    this.t_Devis.filterPredicate = (devis: Devis, rawFilter: string) => {
      if (!rawFilter) return true;
      let f: {
        nomClient?: string;
        startDate?: string | null;
        endDate?: string | null;
        serviceFilter?: string | null;
        statusFilter?: string | number | null;
      };

      try { f = JSON.parse(rawFilter); } catch { return true; }

      // Client (par nom)
      const okClient = (devis.client.denomination_sociale || '').toLowerCase();
     // const okClient = !f.nomClient || clientName.includes(f.nomClient.toLowerCase().trim());

      // Date (sur date_echeance)
      const d = devis?.date_echeance ? new Date(devis.date_echeance) : null;
      const start = f.startDate ? new Date(f.startDate) : null;
      const end = f.endDate ? new Date(f.endDate) : null;
      // normalise end au soir
      if (end) { end.setHours(23,59,59,999); }
      const okDate =
        !d ||
        (
          (!start || d >= start) &&
          (!end   || d <= end)
        );

      // Type de frais (on tolère plusieurs noms de champ possibles)
      const typeCode =
        (devis as any).type_frais ??
          (devis as any).type ??
            (devis as any).code_type ??
              '';
      const okType = !f.serviceFilter || String(typeCode).toLowerCase() === String(f.serviceFilter).toLowerCase();

      // Statut
      const okStatut = !f.statusFilter || String(devis.etat).toLowerCase() === String(f.statusFilter).toLowerCase();

      return okClient && okDate && okType && okStatut;
    };
  }


  reloadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories= categories;
    });
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f=>f.categorieProduit===this.fixeCategorie);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.devisService.getListItems().subscribe((response: Devis[]) => {
      console.log("devis retournes!!")
      console.log(response)
      this.t_Devis.data = response.sort((a, b) => b.id - a.id); // 🔽 Tri décroissant par id
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_Devis.filter = filterValue.trim().toLowerCase();
  }

  crud(devis: Devis, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {devis, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(GestionDevisCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(devis: Devis) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.devisService
          .delete(devis.id)
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
    this.nomClient = '';
    this.startDate = null;
    this.endDate = null;
    this.serviceFilter = null;
    this.statusFilter = null;

    // Filtre “vide” ⇒ tout passe
    this.t_Devis!.filter = '';
    if (this.t_Devis?.paginator) {
      this.t_Devis.paginator.firstPage();
    }
  }


  chercher() {
    // Fabrique l’objet filtre depuis les champs du formulaire
    const filter = {
      nomClient: this.nomClient || '',
      startDate: this.startDate ? new Date(this.startDate).toISOString() : null,
      endDate:   this.endDate   ? new Date(this.endDate).toISOString()   : null,
      serviceFilter: this.serviceFilter || null,
      statusFilter:  this.statusFilter  || null,
    };

    // Applique le filtre (JSON pour le predicate custom)
    this.t_Devis!.filter = JSON.stringify(filter);

    // Revenir à la première page si paginator
    if (this.t_Devis?.paginator) {
      this.t_Devis.paginator.firstPage();
    }
  }


  getCategorie(id:number){
    return this.categories?.find(cat=>cat.id===id)?.libelle;
  }


  onPrintDevis(devis: Devis) {
    // Récupère l'id du devis (qu'il soit un nombre ou un objet avec id)
    const devisId =devis?.id;

    if (!devisId) {
      this.dialogService.alert({ message: 'Aucun devis associé à cette facture.' });
      return;
    }

    this.devisService.genererDevisPDF(devisId).subscribe({
      next: (res: HttpResponse<ArrayBuffer>) => {
        if (!res.body) {
          this.dialogService.alert({ message: 'Le PDF est vide.' });
          return;
        }

        // ArrayBuffer -> Blob(PDF)
        const blob = new Blob([res.body], { type: 'application/pdf' });

        // (Optionnel) Récupère un nom de fichier depuis Content-Disposition
        const cd = res.headers.get('Content-Disposition') || '';
        const m = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
        const filename = m ? decodeURIComponent(m[1]) : `devis_${devisId}.pdf`;

        // Envoie au service d’impression/affichage
        // Si ton pdfViewService accepte un 2e param pour le nom, décommente la ligne suivante :
        // this.pdfViewService.printDirectly(blob, filename);
        this.pdfViewService.printDirectly(blob);
      },
      error: (err) => {
        this.dialogService.alert({
          message: 'Erreur lors de la génération du PDF : ' + (err?.message || err),
        });
      },
    });
  }

  onAnnulerDevis(devis: Devis) {
    if (!devis?.id) {
      this.dialogService.alert({ message: "Devis invalide : identifiant manquant." });
      return;
    }

    this.dialogService
      .yes_no({ message: "Voulez-vous annuler ce devis ?" })
      .pipe(take(1))
      .subscribe(yes => {
        if (!yes) return;

        // Normalisation vers MAJUSCULES (gère string ou {code,label})
        const rawEtat: any = devis.etat;
        const etatCode: string =
          typeof rawEtat === 'string'
            ? rawEtat.toUpperCase()
            : String(rawEtat?.code ?? '').toUpperCase();

        if (!etatCode) {
          this.dialogService.alert({ message: "État de devis inconnu/indéterminé." });
          return;
        }

        // Refus si non annulable
        if (NON_CANCELLABLE.has(etatCode)) {
          const motif = etatCode === 'ANNULE'
            ? "il est déjà annulé"
            : "il a déjà été encaissé/payé";
          this.dialogService.alert({ message: `Impossible d'annuler ce devis : ${motif}.` });
          return;
        }

        // (Optionnel) n’autoriser QUE EMIS
        if (etatCode !== 'EMIS') {
          this.dialogService.alert({ message: "Seuls les devis émis peuvent être annulés." });
          return;
        }

        this.devisService.annulerDevis(devis.id)
          .pipe(take(1), finalize(() => {}))
          .subscribe({
            next: () => {
              this.msgMessageService.success('Devis annulé avec succès');
              this.reloadData();
            },
            error: (error) => {
              const msg = error?.error?.message || error?.message || 'Erreur lors de l’annulation.';
              this.dialogService.alert({ message: msg });
            }
          });
      });
  }

}
