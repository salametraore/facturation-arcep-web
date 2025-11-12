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
import {bouton_names, date_converte, operations} from "../../../constantes";
import {MatTableDataSource} from "@angular/material/table";
import {Facture} from "../../../shared/models/facture";
import {LigneDevis} from "../../../shared/models/ligneDevis";

import {WorkflowHistory} from "../../../shared/models/workflowHistory";
import {Devis} from "../../../shared/models/devis";
import {DevisService} from "../../../shared/services/devis.service";
import {LigneDevisService} from "../../../shared/services/ligne-devis.service";

@Component({
  selector: 'gestion-devis-crud',
  templateUrl: './gestion-devis-crud.component.html'
})
export class GestionDevisCrudComponent implements OnInit {

  displayedColumns: string[] = ['produit_libelle', 'quantite', 'prix_unitaire', 'total'];
  t_LignesDevis?: MatTableDataSource<LigneDevis>;

  devis?: Devis;
  fixeCategorie?: number;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' FicheTechnique';
  categories: CategorieProduit[];
  produits: Produit[];
  lignesDevis: LigneDevis[];
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
    private devisService: DevisService,
    private ligneDevisService: LigneDevisService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<GestionDevisCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.devis = data.devis;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
    this.t_LignesDevis = new MatTableDataSource<LigneDevis>([]);
  }

  ngOnInit(): void {
    console.log(this.devis)
    this.init();
    this.reloadData();
  }

  init() {
    if (this.devis && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.devis && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.devis && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  reloadData() {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if (this.devis) {
        this.client = clients?.find(c => c.id === this.devis?.client.id);
        this.nomClient = this.client?.denomination_sociale;
        this.form.get('numenroCompte').setValue(this.client?.compte_comptable);
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    if (this.devis) {
      this.t_LignesDevis.data = this.devis?.lignes_devis;
    }

  }

  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.devis?.id],
      client: [this.devis?.client.id],
      objet: [this.devis?.objet],
      reference: [this.devis?.reference],
      date_reception: [this.devis?.date_reception],
      date_echeance : [this.devis?.date_echeance],
      numenroCompte: [],
      signataire: [this.devis?.signataire],
      commentaire: [this.devis?.commentaire],
      etat: [this.devis?.etat],
      montant: [this.devis?.montant],
      fiche_technique: [this.devis?.fiche_technique],
      direction_technique: [this.devis?.direction_technique],
      position_direction: [this.devis?.position_direction],
      type_frais : [this.devis?.type_frais],

    });
    this.montant = this.devis?.montant;
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      id: [],
      client: [],
      objet: [],
      reference: [],
      date_reception: [],
      date_echeance : [],
      numenroCompte: [],
      signataire: [],
      commentaire: [],
      montant: [],
      fiche_technique: [],
      direction_technique: [],
      position_direction: [],
      etat: ['EMIS'],
      type_frais: [],
      categorie_produit: [],
    });
  }



  crud() {
    const formValue = this.form.value;

    const toIsoLocal = (d: any): string => {
      const x = (d instanceof Date) ? d : new Date(d);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, '0');
      const day = String(x.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const devis: Devis = new Devis();
    devis.id = this.devis?.id;
    devis.objet = formValue['objet'];
    devis.commentaire = formValue['commentaire'];
    devis.signataire = formValue['signataire'];
    devis.client= this.client ;
    devis.reference= formValue['reference'];
    devis.montant= formValue['montant'];
    devis.fiche_technique= formValue['fiche_technique'];
    devis.direction_technique= formValue['direction_technique'];
    devis.position_direction= formValue['position_direction'];
    devis.etat= formValue['etat'];
    devis.date_reception= date_converte(formValue['date_reception']);
    devis.date_echeance= date_converte(formValue['date_echeance'] ) ;
    devis.type_frais=formValue['type_frais'];

    console.log(devis);
    this.devisService.update(this.devis?.id, devis).subscribe((devis: Devis) => {
      this.devis = devis;
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


}
