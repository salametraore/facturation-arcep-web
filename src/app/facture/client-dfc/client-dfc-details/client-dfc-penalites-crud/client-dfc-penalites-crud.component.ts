import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";
import {Produit} from "../../../../shared/models/produit";
import {Client} from "../../../../shared/models/client";
import {FicheTechniquesService} from "../../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../../shared/services/produits.service";
import {ClientService} from "../../../../shared/services/client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {bouton_names, date_converte, operations} from "../../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ModePaiement} from "../../../../shared/models/mode-paiement";
import {ModePaiementService} from "../../../../shared/services/mode-paiement.service";
import {EncaissementsService} from "../../../../shared/services/encaissements.service";
import {Affectation, EncaissementDetail} from "../../../../shared/models/encaissementDetail";
import {FactureService} from "../../../../shared/services/facture.service";
import {ClientFactureDevisImpayes, Facture,FacturePenalite } from "../../../../shared/models/facture";
import {StepperSelectionEvent} from "@angular/cdk/stepper";
import { forkJoin, of } from 'rxjs';
import {DevisService} from "../../../../shared/services/devis.service";
import {Devis} from "../../../../shared/models/devis";


export type TypeLigne = 'FACTURE' | 'DEVIS';

;

export interface ClientDfcEncaissementData {
  clientId: number;
  lignesImpayees: ClientFactureDevisImpayes[];
  encaissementDetail?: EncaissementDetail;
  operation?: string;
  fixeCategorie?: number;
}


@Component({
  selector: 'client-dfc-penalites-crud',
  templateUrl: './client-dfc-penalites-crud.component.html'
})
export class ClientDfcPenalitesCrudComponent implements OnInit, AfterViewInit {

  clientId!: number;

  encaissementDetail?: EncaissementDetail;
  fixeCategorie?: number;
  firstFormGroup: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' FicheTechnique';
  categories: CategorieProduit[];
  produits: Produit[];
  clients: Client[];
  modePaiements: ModePaiement[];
  facturesImpayees: ClientFactureDevisImpayes[];
  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;

  t_Affectation1?: MatTableDataSource<FacturePenalite>;
  t_Affectation2?: MatTableDataSource<FacturePenalite>;
  ///displayedColumns: string[] = ['type_ligne', 'reference', 'objet', 'date_affectation', 'montant','montant_restant', 'montant_affecte'];

  displayedColumns: string[] = [
    'type_ligne',
    'reference',
    'objet',
    'date_emission',
    'montant',
    'taux_penalite',
    'montant_penalite'
  ];

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selectedRow: any = undefined;
  nomClient: any;
  client: Client;
  somme_affectee: number = 0;
  credit: number = 0;
  isPrint: boolean = false;

  totalPenalites: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private encaissementsService: EncaissementsService,
    private modePaiementService: ModePaiementService,
    private factureService: FactureService,
    private devisService: DevisService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ClientDfcPenalitesCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientDfcEncaissementData,
  ) {
    this.clientId = data.clientId;
    this.facturesImpayees = data.lignesImpayees || [];

    this.encaissementDetail = data.encaissementDetail;
    this.data_operation = data.operation ?? this.operations.create;
    this.fixeCategorie = data.fixeCategorie;

    this.t_Affectation1 = new MatTableDataSource<FacturePenalite>([]);
    this.t_Affectation2 = new MatTableDataSource<FacturePenalite>([]);
  }

  ngAfterViewInit(): void {
    this.t_Affectation1.paginator = this.paginator1;
    this.t_Affectation1.sort = this.sort;
    this.t_Affectation2.paginator = this.paginator2;
    this.t_Affectation2.sort = this.sort;
  }

  ngOnInit(): void {
    this.init();
    this.reloadData();
  }

  init() {
    this.mode = this.operations.create;
    this.title = 'Création Facture de penalités';
  }



  reloadData() {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      // on retrouve le client à partir de clientId passé au dialog
      this.client = clients?.find(c => c.id === this.clientId);
      this.nomClient = this.client?.denomination_sociale;
    });

    this.modePaiementService.getItems().subscribe((modePaiements: ModePaiement[]) => {
      this.modePaiements = modePaiements;
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = this.fixeCategorie
        ? produits?.filter(f => f.categorieProduit === this.fixeCategorie)
        : produits;
    });

    // 🔹 Si on est en création et qu'on a des impayés sélectionnés, on les injecte
    if (!this.encaissementDetail && this.facturesImpayees?.length > 0) {

      const lignes: FacturePenalite[] = this.facturesImpayees.map(f => ({
        facture_id: f.type_ligne === 'DEVIS' ? undefined : f.ligne_id,
        devis_id:   f.type_ligne === 'DEVIS' ? f.ligne_id : undefined,

        type_ligne: f.type_ligne as TypeLigne,

        reference: f.reference,
        objet: f.objet,

        date_emission: f.date_emission,

        montant: f.montant,
        montant_restant: f.montant_restant ?? f.montant,

        taux_penalite: 0,
        montant_penalite: 0
      }));

      this.t_Affectation1.data = lignes;
      this.t_Affectation2.data = [];   // sera rempli au moment du récap
    }
  }


  onStepChange(event: StepperSelectionEvent): void {
    const currentStepIndex = event.selectedIndex;

    if (currentStepIndex === 1) {
      this.copyAffectationsAvecPenalites();
    }
  }


  onMontantAffecteChange1(): void {
    if (!this.t_Affectation1?.data) return;

    this.somme_affectee = this.t_Affectation1.data
      .filter(a => a.montant_penalite != null && Number(a.montant_penalite) > 0)
      .reduce((total, a) => total + (Number(a.montant_penalite) || 0), 0);

    // mettre le crédit à jour en même temps
    const montant = this.montantEncaisseAffiche;
    this.credit = montant - this.somme_affectee;
  }

  genererFacturePenalite(): void {
    const lignes = (this.t_Affectation2?.data || []) as FacturePenalite[];

    if (!lignes.length) {
      this.dialogService.alert({ message: 'Aucune pénalité à générer.' });
      return;
    }

    const payload = {
      clientId: this.clientId,
      totalPenalites: this.totalPenalites,
      lignes: lignes.map(l => ({
        type_ligne: l.type_ligne,
        ligne_id: l.facture_id ?? l.devis_id,
        reference: l.reference,
        montant_restant: l.montant_restant ?? l.montant,
        taux_penalite: l.taux_penalite,
        montant_penalite: l.montant_penalite
      }))
    };

    this.factureService.genererFacturePenalite(payload).subscribe({
      next: () => {
        this.msgMessageService.success('Facture de pénalité générée');
        this.onFermer();
      },
      error: (err) => {
        console.error(err);
        this.dialogService.alert({
          message: err.message || 'Erreur lors de la génération de la facture de pénalité'
        });
      }
    });
  }


  get montantEncaisseAffiche(): number {
    // 1) en mise à jour ou détails : on a déjà encaissementDetail.montant
    if (this.encaissementDetail && this.encaissementDetail.montant != null) {
      return this.encaissementDetail.montant;
    }

    // 2) en création : on lit la valeur du formulaire
    const m = this.firstFormGroup?.get('montant')?.value;
    return Number(m) || 0;
  }

  onNewClient() {
    // Logique pour ajouter un nouveau client
    console.log('Ajouter un nouveau client');
  }

  onFermer() {
    this.dialogRef.close('Yes');
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

  copyAffectationsAvecPenalites(): void {
    if (!this.t_Affectation1?.data) return;

    const lignesRecap: FacturePenalite[] = [];
    let total = 0;

    for (const ligne of this.t_Affectation1.data as FacturePenalite[]) {
      const base = ligne.montant_restant ?? ligne.montant ?? 0;
      const taux = Number(ligne.taux_penalite) || 0;

      if (taux <= 0) {
        continue; // on ignore les lignes sans pénalité
      }

      const montant_penalite = Math.round(base * taux / 100);

      const nouvelleLigne: FacturePenalite = {
        ...ligne,
        montant_penalite
      };

      lignesRecap.push(nouvelleLigne);
      total += montant_penalite;
    }

    this.t_Affectation2 = new MatTableDataSource<FacturePenalite>(lignesRecap);
    this.t_Affectation2.paginator = this.paginator2;
    this.t_Affectation2.sort = this.sort;

    this.totalPenalites = total;
  }






}
