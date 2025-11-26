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
import {ClientFactureDevisImpayes, Facture} from "../../../../shared/models/facture";
import {StepperSelectionEvent} from "@angular/cdk/stepper";
import { forkJoin, of } from 'rxjs';
import {DevisService} from "../../../../shared/services/devis.service";
import {Devis} from "../../../../shared/models/devis";


export type TypeLigne = 'FACTURE' | 'DEVIS';

export type AffectationX = Affectation & {
  reference?: string;
  objet?: string;
  type_ligne?: TypeLigne;
  montant_restant?: number;
};

export interface ClientDfcEncaissementData {
  clientId: number;
  lignesImpayees: ClientFactureDevisImpayes[];
  encaissementDetail?: EncaissementDetail;
  operation?: string;
  fixeCategorie?: number;
}


@Component({
  selector: 'client-dfc-encaissement-crud',
  templateUrl: './client-dfc-encaissement-crud.component.html'
})
export class ClientDfcEncaissementCrudComponent implements OnInit, AfterViewInit {

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
  t_Affectation1?: MatTableDataSource<Affectation>;
  t_Affectation2?: MatTableDataSource<Affectation>;
  ///displayedColumns: string[] = ['type_ligne', 'reference', 'objet', 'date_affectation', 'montant','montant_restant', 'montant_affecte'];
  displayedColumns: string[] = ['type_ligne', 'reference', 'objet', 'date_affectation', 'montant', 'montant_affecte'];
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selectedRow: any = undefined;
  nomClient: any;
  client: Client;
  somme_affectee: number = 0;
  credit: number = 0;
  isPrint: boolean = false;

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
    public dialogRef: MatDialogRef<ClientDfcEncaissementCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientDfcEncaissementData,
  ) {
    this.clientId = data.clientId;
    this.facturesImpayees = data.lignesImpayees || [];

    this.encaissementDetail = data.encaissementDetail;
    this.data_operation = data.operation ?? this.operations.create;
    this.fixeCategorie = data.fixeCategorie;

    this.t_Affectation1 = new MatTableDataSource<Affectation>([]);
    this.t_Affectation2 = new MatTableDataSource<Affectation>([]);
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
    if (this.encaissementDetail && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.encaissementDetail && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.encaissementDetail && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  // ajoute cette méthode dans la classe
  private hydrateAffectationsAvecFactures(affs: Affectation[]): void {
    if (!affs || affs.length === 0) {
      this.t_Affectation1.data = [];
      this.t_Affectation2.data = [];
      return;
    }

    const calls = affs.map(a => {
      if (a.facture_id) {
        return this.factureService.getItem(a.facture_id);   // Observable<Facture>
      }
      if (a.devis_id) {
        return this.devisService.getItem(a.devis_id);       // Observable<Devis>
      }
      return of(null);
    });

    forkJoin(calls).subscribe({
      next: (docs: (Facture | Devis | null)[]) => {

        const merged: AffectationX[] = affs.map((a, index) => {
          const doc = docs[index];

          const reference = (doc as any)?.reference;
          const objet = (doc as any)?.objet;

          // montant vient du doc (Facture ou Devis)
          const montantDoc = (doc as any)?.montant as number | undefined;
          // montant_restant uniquement sur la facture
          const factureDoc = a.facture_id ? (doc as Facture | null) : null;
          const montantRestantFacture = factureDoc?.montant_restant ?? null;

          const type_ligne: TypeLigne | undefined =
            a.facture_id ? 'FACTURE' :
              a.devis_id   ? 'DEVIS'   :
                undefined;

          const ax = a as AffectationX;

          // Montant affiché : priorité au montant venant des impayés, puis du doc
          const montantFinal = a.montant ?? montantDoc ?? 0;

          // Montant restant dérivé :
          // - si ax.montant_restant existe (par ex. DTO impayés), on le garde
          // - sinon, pour une facture, on prend montant_restant de la facture si dispo
          // - sinon, on prend montantFinal
          const montantRestantFinal =
            ax.montant_restant ??
              montantRestantFacture ??
                montantFinal;

          return {
            ...a,
            type_ligne,
            reference: ax.reference ?? reference ?? '',
            objet: ax.objet ?? objet ?? '',
            montant: montantFinal,
            montant_restant: montantRestantFinal,
            date_affectation: (a.date_affectation ?? (doc as any)?.date_echeance ?? null) as any,
          };
        });

        this.t_Affectation1.data = [...merged];
        this.t_Affectation2.data = [...merged];

        this.onMontantAffecteChange1();
      },
      error: (err) => {
        console.error('Hydratation affectations échouée', err);
        this.t_Affectation1.data = [...affs];
        this.t_Affectation2.data = [...affs];
      }
    });
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

      const affectations: AffectationX[] = this.facturesImpayees.map(f => ({
        facture_id: f.type_ligne === 'DEVIS' ? null       : f.ligne_id,
        devis_id:   f.type_ligne === 'DEVIS' ? f.ligne_id : null,
        date_affectation: null,
        montant: f.montant,
        reference: f.reference,
        objet: f.objet,
        type_ligne: f.type_ligne as TypeLigne
        // montant_restant: f.montant_restant ?? f.montant  // si tu as ce champ
      }));

      // on met directement dans la table 1
      this.t_Affectation1.data = [...affectations];

      // Si tu veux enrichir avec les données complètes de facture/devis :
      // this.hydrateAffectationsAvecFactures(affectations as Affectation[]);
    }

    // 🔹 Cas mise à jour : on garde ton code existant
    if (this.encaissementDetail?.affectations?.length > 0) {
      this.somme_affectee = this.encaissementDetail.affectations
        .reduce((total, s) => total + (Number(s.montant_affecte) || 0), 0);

      setTimeout(() => {
        this.credit = Number(this.encaissementDetail?.montant) - this.somme_affectee;
      }, 1000);

      this.hydrateAffectationsAvecFactures(this.encaissementDetail.affectations);
    }
  }

  get montantTotalSelection(): number {
    return (this.facturesImpayees || []).reduce(
      (sum, l) => sum + (Number(l.montant) || 0),
      0
    );
  }

  get soldeNonAffecteCourant(): number {
    const montant = Number(this.firstFormGroup?.get('montant')?.value) || 0;
    return montant - this.somme_affectee;
  }

  onStepChange(event: StepperSelectionEvent): void {
    const currentStepIndex = event.selectedIndex;
    if (currentStepIndex === 2) {
      this.copyAffectationsAvecMontant();

      const montant = Number(this.firstFormGroup.get('montant')?.value) || 0;
      this.credit = montant - this.somme_affectee;
    }
  }


  initForm_update() {
    this.firstFormGroup = this.formBuilder.group({
      client: [this.encaissementDetail?.client],
      objet: [this.encaissementDetail?.objet],
      date_encaissement: [this.encaissementDetail?.date_encaissement],
      mode_paiement: [this.encaissementDetail?.mode_paiement],
      reference: [this.encaissementDetail?.reference],
      montant: [this.encaissementDetail?.montant],
    });
  }

  initForm_create() {
    const montantTotal = this.montantTotalSelection;  // 🔹 somme des impayés sélectionnés

    this.firstFormGroup = this.formBuilder.group({
      client: [this.clientId],
      objet: [''],
      date_encaissement: [new Date()],
      mode_paiement: [''],
      reference: [''],
      montant: [montantTotal],     // 👈 pré-rempli avec le total
    });

    // (optionnel) si tu veux empêcher la modification manuelle :
   ///  this.firstFormGroup.get('montant')?.disable({ emitEvent: false });
  }

  onMontantAffecteChange(): void {
    this.somme_affectee = this.t_Affectation1.data?.reduce((total, a) => total + (Number(a.montant_affecte) || 0), 0);
  }

  onMontantAffecteChange1(): void {
    if (!this.t_Affectation1?.data) return;

    this.somme_affectee = this.t_Affectation1.data
      .filter(a => a.montant_affecte != null && Number(a.montant_affecte) > 0)
      .reduce((total, a) => total + (Number(a.montant_affecte) || 0), 0);

    // mettre le crédit à jour en même temps
    const montant = this.montantEncaisseAffiche;
    this.credit = montant - this.somme_affectee;
  }



  crud(): void {
    // si tu es en création (cas lignes sélectionnées depuis l’onglet impayés)
    const montantEncaissement = !this.encaissementDetail
      ? this.montantTotalSelection                         // 👈 montant = total des impayés sélectionnés
      : Number(this.firstFormGroup.getRawValue().montant); // en mise à jour, on laisse le formulaire décider

    const encaissementDetail: EncaissementDetail = {
      date_encaissement: date_converte(this.firstFormGroup.value.date_encaissement),
      montant: montantEncaissement,
      affecte: this.somme_affectee,
      penalites: 0,
      solde_non_affecte: montantEncaissement - this.somme_affectee,
      reference: this.firstFormGroup.value.reference,
      objet: this.firstFormGroup.value.objet,
      mode_paiement: this.firstFormGroup.value.mode_paiement,
      client: this.client?.id || this.clientId || 0,
      affectations: this.t_Affectation2?.data.map(a => ({
        facture_id: a.facture_id,
        devis_id: a.devis_id,
        montant_affecte: a.montant_affecte,
        date_affectation: a.date_affectation
      })) || []
    };

    if (!this.encaissementDetail) {
      this.encaissementsService.create(encaissementDetail).subscribe({
        next: () => {
          this.msgMessageService.success("Encaissement créé");
          if (this.isPrint) {
            console.log('waiting for print');
          }
        },
        error: (error) => {
          console.log(error);
          this.dialogService.alert({ message: error.message });
        }
      });
    } else {
      this.encaissementsService.update(this.encaissementDetail?.id, encaissementDetail).subscribe({
        next: () => {
          this.msgMessageService.success("Encaissement créé");
          if (this.isPrint) {
            console.log('waiting for print');
          }
        },
        error: (error) => {
          this.dialogService.alert({ message: error.error });
        }
      });
    }
  }

  onSubmit() {
    // Logique pour soumettre la fiche technique
    console.log('this.techSheetForm.value');
  }

  onImport() {
    // Logique pour importer des documents
    console.log('Importer des documents');
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

  onFerme() {
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

  copyAffectationsAvecMontant(): void {
    if (!this.t_Affectation1?.data) return;

    const lignesValides: Affectation[] = [];
    let somme = 0;

    for (const ligne of this.t_Affectation1.data) {
      const montant = Number(ligne.montant) || 0;
      const montantAffecte = Number(ligne.montant_affecte) || 0;

      //  Validation : on empêche uniquement si dépassement
      if (montantAffecte > montant) {
        alert(`Montant affecté (${montantAffecte}) > montant total (${montant}) pour la facture ${ligne.facture_id}`);
        return; // stoppe ici s'il y a dépassement
      }

      if (montantAffecte > 0) {
        lignesValides.push(ligne);
        somme += montantAffecte;
      }
    }

    //  Met à jour la table 2 même si elle est vide
    this.t_Affectation2 = new MatTableDataSource<Affectation>(lignesValides);
    this.t_Affectation2.paginator = this.paginator2;
    this.t_Affectation2.sort = this.sort;

    //  Recalcul de la somme
    this.somme_affectee = somme;
  }



  save() {
    this.isPrint = false;
    this.crud();
  }

  saveAndPrint() {
    this.isPrint = true;
    this.crud();
  }

  onAnciennete(): void {
    if (!this.t_Affectation1?.data?.length) return;

    let montantRestant:number = Number(this.firstFormGroup.get('montant').value);

    // Tri par date d'affectation croissante
    const lignesTriees = this.t_Affectation1.data.sort((a, b) =>
      new Date(a.date_affectation).getTime() - new Date(b.date_affectation).getTime()
    );

    lignesTriees.forEach(ligne => {
      const montantFacture = ligne.montant || 0;

      if (montantRestant <= 0) {
        ligne.montant_affecte = 0;
        return;
      }

      if (montantFacture <= montantRestant) {
        ligne.montant_affecte = montantFacture;
        montantRestant -= montantFacture;
      } else {
        ligne.montant_affecte = montantRestant;
        montantRestant = 0;
      }
    });

    // Mise à jour de la table
    this.t_Affectation1._updateChangeSubscription();

    // Recalcul de la somme affectée
    this.onMontantAffecteChange1();
  }

  onVider() {

  }
}
