import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {Client} from "../../../shared/models/client";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {bouton_names, date_converte, operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ModePaiement} from "../../../shared/models/mode-paiement";
import {ModePaiementService} from "../../../shared/services/mode-paiement.service";
import {EncaissementsService} from "../../../shared/services/encaissements.service";
import {Affectation, EncaissementDetail} from "../../../shared/models/encaissementDetail";
import {FactureService} from "../../../shared/services/facture.service";
import {Facture} from "../../../shared/models/facture";
import {StepperSelectionEvent} from "@angular/cdk/stepper";

@Component({
  selector: 'app-encaissement-crud',
  templateUrl: './encaissement-crud.component.html',
  styleUrl: './encaissement-crud.component.scss'
})
export class EncaissementCrudComponent implements OnInit, AfterViewInit {

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
  facturesImpayees: Facture[];
  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  t_Affectation1?: MatTableDataSource<Affectation>;
  t_Affectation2?: MatTableDataSource<Affectation>;
  displayedColumns: string[] = ['facture_id', 'date_affectation', 'montant', 'montant_affecte'];
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
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<EncaissementCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.encaissementDetail = data.encaissementDetail;
    this.data_operation = data.operation;
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

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if (this.encaissementDetail) {
        this.client = clients?.find(c => c.id === this.encaissementDetail?.client);
        this.nomClient = this.client?.denomination_sociale;
      }
    });
    this.modePaiementService.getItems().subscribe((modePaiements: ModePaiement[]) => {
      this.modePaiements = modePaiements;
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    if (this.encaissementDetail?.affectations?.length > 0) {
      this.t_Affectation1.data = [...this.encaissementDetail.affectations];
      this.t_Affectation2.data = [...this.encaissementDetail.affectations];
      this.somme_affectee = this.encaissementDetail.affectations
        .reduce((total, s) => total + (Number(s.montant_affecte) || 0), 0);
      setTimeout(() => {
        this.credit = Number(this.encaissementDetail?.montant) - this.somme_affectee;
      }, 1000);
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
    this.firstFormGroup = this.formBuilder.group({
      client: [''],
      objet: [''],
      date_encaissement: [''],
      mode_paiement: [''],
      reference: [''],
      montant: [''],
    });
  }

  onMontantAffecteChange(): void {
    this.somme_affectee = this.t_Affectation1.data?.reduce((total, a) => total + (Number(a.montant_affecte) || 0), 0);
  }

  onMontantAffecteChange1(): void {
    if (!this.t_Affectation1?.data) return;
    this.somme_affectee = this.t_Affectation1.data
      .filter(a => a.montant_affecte && a.montant_affecte > 0)
      .reduce((total, a) => total + a.montant_affecte!, 0);
  }

  getInfosComplementaire(client: Client) {
    this.client = client;
    if (!this.encaissementDetail) {
      this.factureService.getListFacturesByEtat(client.id,'EN_ATTENTE').subscribe((factures: Facture[]) => {
        this.facturesImpayees = factures.filter(f => f.etat === 'EN_ATTENTE');
        //this.facturesImpayees =factures;
        console.log(factures);
        let affectations: Affectation[] = this.facturesImpayees.map(a => ({
          facture_id: a.id,
          date_affectation: a.date_echeance,
          montant: a.montant
        }));
        setTimeout(() => {
          this.t_Affectation1.data = [...affectations];
        }, 1000);
      });
    }
  }

  crud(): void {
    const encaissementDetail: EncaissementDetail = {
      date_encaissement: date_converte(this.firstFormGroup.value.date_encaissement),
      montant: Number(this.firstFormGroup.value.montant),
      affecte: this.somme_affectee,
      penalites: 0,
      solde_non_affecte: Number(this.firstFormGroup.value.montant) - this.somme_affectee,
      reference: this.firstFormGroup.value.reference,
      objet: this.firstFormGroup.value.objet,
      mode_paiement: this.firstFormGroup.value.mode_paiement,
      client: this.client?.id || 0,
      affectations: this.t_Affectation2?.data.map(a => ({
        facture_id: a.facture_id,
        montant_affecte: a.montant_affecte,
        date_affectation: a.date_affectation
      })) || []
    };

    if (!this.encaissementDetail) {
      this.encaissementsService.create(encaissementDetail).subscribe(data => {
        this.msgMessageService.success("Encaissement créé");
        if (this.isPrint === true) {
          console.log('waiting for print');
        }
      }, error => {
        console.log(error)
        this.dialogService.alert({message: error.error});
      });
    } else {
      this.encaissementsService.update(this.encaissementDetail?.id, encaissementDetail).subscribe(data => {
        this.msgMessageService.success("Encaissement créé");
        if (this.isPrint === true) {
          console.log('waiting for print');
        }
      }, error => {
        this.dialogService.alert({message: error.error});
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
      const montant = ligne.montant || 0;
      const montantAffecte = ligne.montant_affecte || 0;

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


  onStepChange(event: StepperSelectionEvent): void {
    const currentStepIndex = event.selectedIndex;
    if (currentStepIndex === 2) {
      this.copyAffectationsAvecMontant();
    }
  }


  save() {
    this.isPrint = false;
    this.crud();
  }

  saveAndPrint() {
    this.isPrint = true;
    this.crud();
  }

  onAncinnete(): void {
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
