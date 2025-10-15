import {Component, Inject, OnInit} from '@angular/core';
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
import {AuthService} from "../../../authentication/auth.service";
import {bouton_names, operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniqueAFacturer, ProduitFiche} from "../../../shared/models/fiche-technique-a-facturer";
import {FactureService} from "../../../shared/services/facture.service";
import {RequestGenererFacture} from "../../../shared/models/ficheTechniques";
import {WorkflowHistory} from "../../../shared/models/workflowHistory";
import {HistoriqueFicheTechnique} from "../../../shared/models/historique-traitement-fiche-technique";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-elements-facture-recu-crud',
  templateUrl: './elements-facture-recu-crud.component.html',
  styleUrl: './elements-facture-recu-crud.component.scss'
})
export class ElementsFactureRecuCrudComponent implements OnInit {

  displayedColumns: string[] = ['produit_nom', 'quantite', 'prix_unitaire', 'total'];
  t_ProduitFiche?: MatTableDataSource<ProduitFiche>;

  ficheTechniqueAFacturer?: FicheTechniqueAFacturer;
  fixeCategorie?: number;
  form: FormGroup;
  mode: string = '';
  title: string = '';

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
        this.form.get('numenroCompte')?.setValue(this.client?.compte_comptable);
      }
      if (this.ficheTechniqueAFacturer?.liste_produits?.length > 0) {
        this.t_ProduitFiche!.data = [...this.ficheTechniqueAFacturer?.liste_produits];
      }
      // PATCH: calcul total supprimé ici — le getter ci-dessous s’en charge dynamiquement
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


  get totalGeneral(): number {
    const data = this.t_ProduitFiche?.data ?? [];
    return data.reduce((sum: number, e: any) => sum + (Number(e?.total) || 0), 0);
  }

  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.ficheTechniqueAFacturer?.fiche_technique_id],
      client: [this.ficheTechniqueAFacturer?.client_id],
      objet: [this.ficheTechniqueAFacturer?.type_frais_description],
      numenroCompte: [],
      signataire: [this.ficheTechniqueAFacturer?.signataire],
      produit: [],
      commentaire: [],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      id: [],
      client: [],
      objet: [],
      numenroCompte: [],
      signataire: [],
      commentaire: [],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
  }

  crud() {
    const payload: RequestGenererFacture = {
      fiche_technique_id: this.ficheTechniqueAFacturer?.fiche_technique_id,
      commentaire: this.form.get('commentaire')?.value,
      objet: this.form.get('objet')?.value,
      signataire: this.form.get('signataire')?.value
    };

    console.log(payload.toString());
    console.log(this.ficheTechniqueAFacturer?.toString());

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

  genererDossierFacture(payload: RequestGenererFacture) {
    this.factureService.genererFraisDossier(payload).subscribe({
      next: () => this.msgMessageService.success('Facture générée avec succès !'),
      error: (error) => this.dialogService.alert({ message: error?.error?.message })
    });
  }

  genererRedevanceFacture(payload: RequestGenererFacture) {
    this.factureService.genererFraisRedevance(payload).subscribe({
      next: () => this.msgMessageService.success('Facture générée avec succès !'),
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
    this.client = client;
  }

  protected readonly undefined = undefined;
}
