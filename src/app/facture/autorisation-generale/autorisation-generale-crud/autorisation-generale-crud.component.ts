import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {FicheTechniques, MiseAJourStatutFiche} from "../../../shared/models/ficheTechniques";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {Client} from "../../../shared/models/client";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../authentication/auth.service";
import {bouton_names, operations} from "../../../constantes";
import {HistoriqueFicheTechnique} from "../../../shared/models/historique-traitement-fiche-technique";

@Component({
  selector: 'autorisation-generale-crud',
  templateUrl: './autorisation-generale-crud.component.html'
})
export class AutorisationGeneraleCrudComponent implements OnInit {
  @Input() fixeCategorie: number;
  @Input() ficheTechnique: FicheTechniques;
  @Input() operation: string;
  @Output() notifyFicheTechnique: EventEmitter<FicheTechniques> = new EventEmitter<FicheTechniques>();
  @Output() notifyActionOperation: EventEmitter<string> = new EventEmitter<string>();

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
  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    private authServiceService: AuthService,
  ) {

  }

  ngOnInit(): void {
    console.log(this.ficheTechnique)
    if (!this.ficheTechnique) {
      this.initForm_create();
    } else {
      this.initForm_update();
    }
    this.reloadData();
  }

  reloadData() {

    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });



    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if (this.ficheTechnique) {
        this.client = clients?.find(c => c.id === this.ficheTechnique?.client);
        this.nomClient = this.client?.denomination_sociale;
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.id === 76);
      this.form.get('produit').setValue(this.produits[0]?.id);
    });

    if (this.ficheTechnique?.id) {
      this.ficheTechniquesService
        .getHistoriqueTraitementFicheTechnique(this.ficheTechnique.id)
        .subscribe((historiqueFicheTechniquesLoc: HistoriqueFicheTechnique[]) => {
          this.historiqueFicheTechniques = historiqueFicheTechniquesLoc;
        });
    } else {
      this.historiqueFicheTechniques = [];
    }


  }

  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.ficheTechnique?.id],
      client: [this.ficheTechnique?.client],
      produit: [],
      commentaire: [this.ficheTechnique?.commentaire],
    });
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      id: [],
      client: [],
      produit: [76],
      commentaire: [],
    });
  }

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  crud() {
    const formValue = this.form.value;


    const dataFicheTechnique = {
      client: this.client?.id,
      direction: 1,
      utilisateur: '1',
      position: 1,
      commentaire: formValue['commentaire'],
      categorie_produit: this.fixeCategorie,
      produits_detail: [
        {produit: Number(formValue['produit']), quantite: 1},
      ],
    };

    // Construire FormData
    const formData = new FormData();

    // Champs simples
    formData.append('client', String(dataFicheTechnique.client));
    formData.append('direction', String(dataFicheTechnique.direction));
    formData.append('utilisateur', String(dataFicheTechnique.utilisateur));
    formData.append('position', String(dataFicheTechnique.position));
    formData.append('commentaire', String(dataFicheTechnique.commentaire));
    formData.append('categorie_produit', String(dataFicheTechnique.categorie_produit));
    formData.append('objet', String(this.getCategorieProduit(dataFicheTechnique.categorie_produit)));

    // Produits (JSON stringifié)
    formData.append('produits', JSON.stringify(dataFicheTechnique.produits_detail));

    // Upload fichiers
    /*    files.forEach(file => {
          formData.append('documents', file, file.name);
        });*/

    // Choisir la requête : création ou mise à jour
    const request$ =
      this.operation === operations.update
        ? this.ficheTechniquesService.update(this.ficheTechnique.id, formData)
        : this.ficheTechniquesService.create(formData);

    request$.subscribe(
      (data) => {
        this.msgMessageService.success('Fiche technique enregistrée avec succès');
      },
      (error) => {
        this.dialogService.alert({message: error.message});
      }
    );
  }

  onTransmettre() {
    const miseAJourStatutFiche: MiseAJourStatutFiche = new MiseAJourStatutFiche();
    miseAJourStatutFiche.fiche_technique = this.ficheTechnique?.id;
    miseAJourStatutFiche.statut = 2;
    this.ficheTechniquesService.setStatutFiche(miseAJourStatutFiche).subscribe((respone: MiseAJourStatutFiche) => {
      this.msgMessageService.success("Fiche transmise avec succès !");
    }, error => {
      this.dialogService.alert({message: error.message});
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

  onGetClient(client: Client) {
    this.client = client;
  }

  onRetour() {
    this.notifyActionOperation.emit(operations.table);
    this.ficheTechnique = undefined;
    this.notifyFicheTechnique.emit(this.ficheTechnique);
  }


}
