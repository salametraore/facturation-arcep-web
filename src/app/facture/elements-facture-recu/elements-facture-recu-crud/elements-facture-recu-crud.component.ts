import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms"; // <-- Validators ici
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
import {AuthService} from "../../../authentication/auth.service";
import {bouton_names, operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniqueAFacturer, ProduitFiche} from "../../../shared/models/fiche-technique-a-facturer";
import {FactureService} from "../../../shared/services/facture.service";
import {RequestGenererFacture} from "../../../shared/models/ficheTechniques";
import {HistoriqueFicheTechnique} from "../../../shared/models/historique-traitement-fiche-technique";
import { finalize } from 'rxjs/operators';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-elements-facture-recu-crud',
  templateUrl: './elements-facture-recu-crud.component.html'
})
export class ElementsFactureRecuCrudComponent implements OnInit {

  displayedColumns: string[] = ['produit_nom', 'quantite', 'prix_unitaire', 'total'];
  t_ProduitFiche?: MatTableDataSource<ProduitFiche>;

  ficheTechniqueAFacturer?: FicheTechniqueAFacturer;
  fixeCategorie?: number;
  form: FormGroup;
  mode: string = '';
  title: string = '';

  isGenerating = false;
  hasGenerated = false;

  window_name = ' FicheTechnique';
  categories: CategorieProduit[];
  produits: Produit[];
  clients: Client[];
  client: Client;
  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  nomClient: any;
  historiqueFicheTechniques: HistoriqueFicheTechnique[];



  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private factureService: FactureService,
    public dialog: MatDialog,
    private snack: MatSnackBar,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ElementsFactureRecuCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.ficheTechniqueAFacturer = data.ficheTechniqueAFacturer;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
    this.t_ProduitFiche = new MatTableDataSource<ProduitFiche>([]);
  }

  ngOnInit(): void {
    console.log(this.ficheTechniqueAFacturer);
    this.init();
    this.reloadData();
  }

  init() {
    if (this.ficheTechniqueAFacturer && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.ficheTechniqueAFacturer && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.ficheTechniqueAFacturer && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      console.log(this.ficheTechniqueAFacturer);
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if (this.ficheTechniqueAFacturer) {
        this.client = clients?.find(c => c.id === this.ficheTechniqueAFacturer?.client_id);
        this.nomClient = this.client?.denomination_sociale;
        // Remplit aussi le champ client du form pour passer la validation
        this.form.get('client')?.setValue(this.client?.id ?? null);
        this.form.get('numenroCompte')?.setValue(this.client?.compte_comptable);
      }
      if (this.ficheTechniqueAFacturer?.liste_produits?.length > 0) {
        this.t_ProduitFiche!.data = [...this.ficheTechniqueAFacturer?.liste_produits];
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    this.ficheTechniquesService
      .getHistoriqueTraitementFicheTechnique(this.ficheTechniqueAFacturer?.fiche_technique_id)
      .subscribe((historiqueFicheTechniquesLoc: HistoriqueFicheTechnique[]) => {
        this.historiqueFicheTechniques = historiqueFicheTechniquesLoc;
      });
  }

  /** Total général dynamique */
  get totalGeneral(): number {
    const data = this.t_ProduitFiche?.data ?? [];
    return data.reduce((sum: number, e: any) => sum + (Number(e?.total) || 0), 0);
  }

  /** Form update: champs requis */
  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.ficheTechniqueAFacturer?.fiche_technique_id],
      // client stocke l'ID ; affichage via nomClient
      client: [this.ficheTechniqueAFacturer?.client_id ?? null, Validators.required],
      objet: [this.ficheTechniqueAFacturer?.type_frais_description ?? null, Validators.required],
      numenroCompte: [],
      signataire: [this.ficheTechniqueAFacturer?.signataire ?? null, Validators.required],
      produit: [],
      commentaire: [],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
  }

  /** Form create: champs requis */
  initForm_create() {
    this.form = this.formBuilder.group({
      id: [],
      client: [null, Validators.required],
      objet: [null, Validators.required],
      numenroCompte: [],
      signataire: [null, Validators.required],
      commentaire: [],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
  }

  /** Helper pour le bouton: au moins 1 ligne + formulaire valide */
  isReadyToGenerate(): boolean {
    const hasRows = !!this.t_ProduitFiche?.data?.length;
    return hasRows && this.form?.valid && !this.isGenerating && !this.hasGenerated;
  }

  crud() {
    if (this.hasGenerated) {
      return;  // déjà généré pour cette fiche, on ne refait pas
    }

    if (!this.isReadyToGenerate()) { return; }

    const payload: RequestGenererFacture = {
      fiche_technique_id: this.ficheTechniqueAFacturer?.fiche_technique_id,
      commentaire: this.form.get('commentaire')?.value,
      objet: this.form.get('objet')?.value,
      signataire: this.form.get('signataire')?.value
    };

    const type = this.ficheTechniqueAFacturer?.type_frais;
    const redevanceTypes = new Set(['RD', 'LO', 'EL', 'IN', 'RA', 'DA']);

    if (type === 'FD') {
      this.genererDossierFacture(payload);
    } else if (redevanceTypes.has(type!)) {
      this.genererRedevanceFacture(payload);
    } else {
      console.log('Type de frais non supporté');
    }
  }


  private onGenerationSuccess(): void {
    this.hasGenerated = true;                 // 🔒 on grille le bouton
    this.form.disable({ emitEvent: false });  // optionnel : figer le formulaire

    const msg = 'Devis généré avec succès 🎉';
    this.msgMessageService.success(msg);
    this.snack.open(msg, 'OK', { duration: 4000 });
  }

  genererDossierFacture(payload: RequestGenererFacture) {
    this.isGenerating = true;
    this.factureService.genererFraisDossier(payload)
      .pipe(finalize(() => this.isGenerating = false))
      .subscribe({
        next: () => this.onGenerationSuccess(),
        error: (error) => this.dialogService.alert({ message: error?.error?.message })
      });
  }

  genererRedevanceFacture(payload: RequestGenererFacture) {
    this.isGenerating = true;
    this.factureService.genererFraisRedevance(payload)
      .pipe(finalize(() => this.isGenerating = false))
      .subscribe({
        next: () => this.onGenerationSuccess(),
        error: (error) => this.dialogService.alert({ message: error?.error?.message })
      });
  }

  onSubmit() {
    console.log('this.techSheetForm.value');
  }

  onImport() {
    console.log('Importer des documents');
  }

  onNewClient() {
    console.log('Ajouter un nouveau client');
  }

  onFerme() {
    this.dialogRef.close('Yes');
  }

  onGetClient(client: Client) {
    // Met à jour le modèle d’affichage et les champs du formulaire (validation OK)
    this.client = client;
    ///this.nomClient = client?.denomination_sociale; // pour l’input visible
    this.form.patchValue({
      client: client?.id ?? null,
      numenroCompte: client?.compte_comptable ?? null
    });
  }

  // Affiche le nom du client alors que le contrôle 'client' stocke l'ID
  displayClient = (id?: number) => {
    if (id == null) return '';
    // Fallback instantané sur la donnée déjà fournie par la fiche
    if (this.ficheTechniqueAFacturer?.client_id === id && this.ficheTechniqueAFacturer?.client_nom) {
      return this.ficheTechniqueAFacturer.client_nom;
    }
    // Sinon, chercher dans la liste chargée
    const found = this.clients?.find(c => c.id === id);
    return found?.denomination_sociale ?? '';
  };

  protected readonly undefined = undefined;
}
