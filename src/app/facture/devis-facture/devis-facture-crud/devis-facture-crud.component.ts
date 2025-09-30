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
import {Facture} from "../../../shared/models/facture";
import {LignesFactures} from "../../../shared/models/lignesFactures";
import {FactureService} from "../../../shared/services/facture.service";

@Component({
  selector: 'app-devis-facture-crud',
  templateUrl: './devis-facture-crud.component.html',
  styleUrl: './devis-facture-crud.component.scss'
})
export class DevisFactureCrudComponent implements OnInit {

  displayedColumns: string[] = ['produit', 'produit_libelle', 'quantite', 'prix_unitaire', 'total'];
  t_LignesFactures?: MatTableDataSource<LignesFactures>;

  facture?: Facture;
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
  montant: number;

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
    public dialogRef: MatDialogRef<DevisFactureCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.facture = data.facture;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
    this.t_LignesFactures = new MatTableDataSource<LignesFactures>([]);
  }

  ngOnInit(): void {
    console.log(this.facture)
    this.init();
    this.reloadData();
  }

  init() {
    if (this.facture && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.facture && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.facture && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if (this.facture) {
        this.client = clients?.find(c => c.id === this.facture?.client);
        this.nomClient = this.client?.denomination_sociale;
        this.form.get('numenroCompte').setValue(this.client?.compte_comptable);
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    if (this.facture) {
      this.t_LignesFactures.data = this.facture?.lignes_facture;
    }
  }

  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.facture?.id],
      client: [this.facture?.client],
      objet: [this.facture?.objet],
      numenroCompte: [],
      signataire: [this.facture?.signataire],
      commentaire: [this.facture?.commentaire],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
    this.montant = this.facture?.montant;
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
    const formValue = this.form.value;
    const facture: Facture = new Facture();
    facture.id = this.facture?.id;
    facture.objet = formValue['objet'];
    facture.commentaire = formValue['commentaire'];
    facture.signataire = formValue['signataire'];
    this.factureService.update(this.facture?.id, facture).subscribe((facture: Facture) => {
      this.facture = facture;
      this.msgMessageService.success("Facture modifiée avec succès !");
    }, error => {
      this.dialogService.alert({message: error.message});
      this.errorMessage = error.error?.message || error.message;
    });
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

  onGetClient(client: Client) {
    this.client = client;
  }

  getLibelleProduit(id: number) {
    return this.produits?.find(p => p.id === id)?.libelle;
  }

}
