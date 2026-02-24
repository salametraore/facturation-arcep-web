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
import {operations, TYPE_FRAIS,ETATS_FACTURE} from "../../constantes";
import {DevisFactureCrudComponent} from "./devis-facture-crud/devis-facture-crud.component";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {Facture} from "../../shared/models/facture";
import {FactureService} from "../../shared/services/facture.service";
import {HttpResponse} from "@angular/common/http";
import {EncaissementDirectCrudComponent} from "../encaissement-direct/encaissement-direct-crud/encaissement-direct-crud.component";
import {GenerationRedevanceCrudComponent} from "../generation-redevance/generation-redevance-crud/generation-redevance-crud.component";
import {Devis} from "../../shared/models/devis";
import {finalize, take} from "rxjs/operators";


const NON_CANCELLABLE = new Set<string>(['PAYEE', 'ANNULEE']);


@Component({
  selector: 'app-devis-facture',
  templateUrl: './devis-facture.component.html'
})
export class DevisFactureComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie:number;

  t_Facture?: MatTableDataSource<Facture>;
  displayedColumns: string[] = ['reference','client','montant', 'date_echeance','objet', 'etat','actions'];
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
  etatsfacture=ETATS_FACTURE;

  constructor(
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private pdfViewService: PdfViewService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_Facture = new MatTableDataSource<Facture>([]);
  }

  ngAfterViewInit(): void {
    this.t_Facture.paginator = this.paginator;
    this.t_Facture.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
    this.fixeCategorie = 9;

    // 🔎 Filtre multi-critères
    this.t_Facture.filterPredicate = (data: Facture, rawFilter: string) => {
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
      const clientName = (this.getClient(data.client) || '').toLowerCase();
      const okClient = !f.nomClient || clientName.includes(f.nomClient.toLowerCase().trim());

      // Date (sur date_echeance)
      const d = data?.date_echeance ? new Date(data.date_echeance) : null;
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
        (data as any).type_frais ??
          (data as any).type ??
            (data as any).code_type ??
              '';
      const okType = !f.serviceFilter || String(typeCode).toLowerCase() === String(f.serviceFilter).toLowerCase();

      // Statut
      const okStatut = !f.statusFilter || String(data.etat).toLowerCase() === String(f.statusFilter).toLowerCase();

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

    this.factureService.getListItems().subscribe((response: Facture[]) => {
      this.t_Facture.data = response.sort((a, b) => b.id - a.id); // 🔽 Tri décroissant par id
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_Facture.filter = filterValue.trim().toLowerCase();
  }

  crud(facture: Facture, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1024px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {facture, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(DevisFactureCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(facture: Facture) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.factureService
          .delete(facture.id)
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
    this.t_Facture!.filter = '';
    if (this.t_Facture?.paginator) {
      this.t_Facture.paginator.firstPage();
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
    this.t_Facture!.filter = JSON.stringify(filter);

    // Revenir à la première page si paginator
    if (this.t_Facture?.paginator) {
      this.t_Facture.paginator.firstPage();
    }
  }


  getCategorie(id:number){
    return this.categories?.find(cat=>cat.id===id)?.libelle;
  }



  getClient(id: number) {
    return this.clients?.find(c => c.id === id)?.denomination_sociale;
  }

  onPrintFacturePDF(facture: Facture) {
    this.factureService.genererFacturePDF(facture?.id).subscribe({
      next: (res: HttpResponse<ArrayBuffer>) => {
        if (!res.body) {
          this.dialogService.alert({ message: 'Le PDF est vide.' });
          return;
        }

        // Convertit l’ArrayBuffer en Blob PDF
        const blob = new Blob([res.body], { type: 'application/pdf' });

        // (Optionnel) Essaie d’extraire un nom de fichier depuis Content-Disposition
        const cd = res.headers.get('Content-Disposition') || '';
        const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
        const fallback = `facture_${(facture as any)?.numero ?? facture?.id}.pdf`;
        const filename = match ? decodeURIComponent(match[1]) : fallback;

        // Si ton service accepte un filename en 2e param, passe-le, sinon envoie juste le Blob
        // this.pdfViewService.printDirectly(blob, filename);
        this.pdfViewService.printDirectly(blob);
      },
      error: (err) => {
        this.dialogService.alert({ message: 'Erreur lors de la génération du PDF : ' + (err?.message || err) });
      }
    });
  }

  onPrintFactureExcel(facture: Facture): void {
    const factureId =facture?.id;

    if (!factureId) {
      this.dialogService.alert({ message: 'Aucun devis associé à cette facture.' });
      return;
    }

    this.factureService.genererFactureExcel(factureId).subscribe({
      next: (arrayBuffer: ArrayBuffer) => {
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          this.dialogService.alert({ message: 'Le fichier Excel est vide.' });
          return;
        }

        const blob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const filename = `releve_client_${factureId}.xlsx`;

        const objectUrl = URL.createObjectURL(blob); // ✅ pas de window.URL

        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(objectUrl); // ✅ pas de window.URL
      },
      error: (err) => {
        this.dialogService.alert({
          message: 'Erreur lors de la génération du relevé Excel : ' + (err?.message || err)
        });
      }
    });
  }

  openGenererRedevancesAnnuelles(): void {
    const dialogRef = this.dialog.open(GenerationRedevanceCrudComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      data: {}
    });
    dialogRef.afterClosed().subscribe(() => {
      // rafraîchir si nécessaire
      this.chercher?.();
    });
  }

  onAnnulerFacture(facture: Facture) {
    if (!facture?.id) {
      this.dialogService.alert({ message: "Facture invalide : identifiant manquant." });
      return;
    }

    this.dialogService
      .yes_no({ message: "Voulez-vous annuler cette facture  ?" })
      .pipe(take(1))
      .subscribe(yes => {
        if (!yes) return;

        // Normalisation vers MAJUSCULES (gère string ou {code,label})
        const rawEtat: any = facture.etat;
        const etatCode: string =
          typeof rawEtat === 'string'
            ? rawEtat.toUpperCase()
            : String(rawEtat?.code ?? '').toUpperCase();

        if (!etatCode) {
          this.dialogService.alert({ message: "État de facture inconnu/indéterminé." });
          return;
        }

        // Refus si non annulable
        if (NON_CANCELLABLE.has(etatCode)) {
          const motif = etatCode === 'ANNULEE'
            ? "elle est déjà annulée"
            : "elle a déjà été encaissée/payée";
          this.dialogService.alert({ message: `Impossible d'annuler cette facture : ${motif}.` });
          return;
        }

        // (Optionnel) n’autoriser QUE EMIS
        if (etatCode !== 'EMISE') {
          this.dialogService.alert({ message: "Seuls les factures émises peuvent être annulées." });
          return;
        }

        this.factureService.annulerFacture(facture.id)
          .pipe(take(1), finalize(() => {}))
          .subscribe({
            next: () => {
              this.msgMessageService.success('Facture annulée avec succès');
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
