import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FicheTechniques, MiseAJourStatutFiche} from "../../../../shared/models/ficheTechniques";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";
import {Produit} from "../../../../shared/models/produit";
import {Client} from "../../../../shared/models/client";
import {FicheTechniquesService} from "../../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../../shared/services/produits.service";
import {ClientService} from "../../../../shared/services/client.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogService} from "../../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {AuthService} from "../../../../authentication/auth.service";
import {bouton_names, operations} from "../../../../constantes";
import {HistoriqueFicheTechnique} from "../../../../shared/models/historique-traitement-fiche-technique";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'client-crud-agrement-installeur',
  templateUrl: './client-crud-agrement-installeur.component.html'
})
export class ClientCrudAgrementInstalleurComponent implements OnInit {

  fixeCategorie: number;
  ficheTechnique: FicheTechniques | undefined;
  operation: string;
  canAddProduit = true;
  nomClient: string;
  clientId: number;
  saveLocked = false;

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
	private route: ActivatedRoute,
    private router: Router,

  ) {

  }
  ngOnInit(): void {

    // 1) Récupérer clientId dans l’URL
    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));
    console.log('client id ', this.clientId);

    // 2) Récupérer operation, fixeCategorie, ficheId dans les query params
    const qp = this.route.snapshot.queryParamMap;

    this.operation = qp.get('op') || this.operations.create;
    this.fixeCategorie = Number(qp.get('cat')) || 12;

    const ficheId = Number(qp.get('ficheId'));

    if (ficheId) {
      // 🔹 MODE UPDATE
      this.ficheTechniquesService.getItem(ficheId).subscribe(ft => {
        this.ficheTechnique = ft;

        // formulaire en mode update
        this.initForm_update();

        // chargement clients / produits / historique
        this.reloadData();
      });
    } else {
      // 🔹 MODE CREATE
      this.initForm_create();

      // pré-positionner le client (transmis dans l’URL)
      if (this.clientId) {
        this.form.patchValue({ client: this.clientId });
      }

      // ⚠️ important : il faut aussi charger clients / produits / historique même en création
      this.reloadData();
    }
  }





  reloadData() {
    // Catégories (si tu en as besoin ailleurs)
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    // Clients
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      if (this.ficheTechnique) {
        // mode update : client vient de la fiche
        this.client = clients?.find(c => c.id === this.ficheTechnique?.client);
      } else if (this.clientId) {
        // mode création : clientId dans l’URL
        this.client = clients?.find(c => c.id === this.clientId);
      }

      if (this.client) {
        this.nomClient = this.client.denomination_sociale;

        if (this.form?.get('client')) {
          this.form.patchValue({ client: this.client.id });
        }
      }
    });

    // Produits : on force la catégorie "agrément installeur" (id 75)
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits?.filter(f => f.id === 75);

      const defaultProduitId = this.produits[0]?.id ?? 75;

      if (this.form?.get('produit')) {
        this.form.get('produit')!.setValue(defaultProduitId);
      }
    });

    // Historique
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
      produit: [75],
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
      (data: FicheTechniques) => {
        this.msgMessageService.success('Fiche technique enregistrée avec succès');

        // 🔒 on bloque la sauvegarde après succès
        this.saveLocked = true;

        // (optionnel) on met à jour l'opération / la fiche en mémoire
        this.operation = this.operations.update;
        this.ficheTechnique = data;
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


  onRetour() {
    this.router.navigate(
      ['/facture/client-direction-technique-detail', this.clientId]
    );
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



}
