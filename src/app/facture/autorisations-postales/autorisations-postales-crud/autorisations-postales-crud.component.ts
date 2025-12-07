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
import {ZoneCouverture} from "../../../shared/models/zone-couverture";
import {ZoneCouvertureService} from "../../../shared/services/zone-couverture.service";

@Component({
  selector: 'autorisations-postales-crud',
  templateUrl: './autorisations-postales-crud.component.html'
})
export class AutorisationsPostalesCrudComponent implements OnInit {
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
  productAllowedIds: number[] = [81, 82];

  clients: Client[];
  client: Client;
  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  nomClient: any;
  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  saveLocked = false;

  zoneCouvertures:ZoneCouverture[];
  zoneCouverture:ZoneCouverture;

  isProduit81 = false;

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private zoneCouvertureService: ZoneCouvertureService,
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
      this.produits = produits.filter(p =>
        p.categorieProduit === this.fixeCategorie &&
        p.id != null &&
        this.productAllowedIds.includes(p.id)
      );
    });

    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = listeZones.filter(z =>
        z.categorie_produit === this.fixeCategorie
      );
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
      zone_id: [this.ficheTechnique?.produits_detail[0].zone_id],
      produit: [this.ficheTechnique?.produits_detail[0].produit],
      commentaire: [this.ficheTechnique?.commentaire],
    });

    this.subscribeProduitChanges();

  }

  initForm_create() {
    this.form = this.formBuilder.group({
      id: [],
      client: [],
      zone_id: [],
      produit: [],
      commentaire: [],
    });

    this.subscribeProduitChanges();

  }

  private subscribeProduitChanges() {
    const produitCtrl = this.form.get('produit');
    if (!produitCtrl) return;

    // Appel initial si un produit est déjà présent (mode update)
    this.onProduitChange(produitCtrl.value);

    // Suivre les changements
    produitCtrl.valueChanges.subscribe(value => {
      this.onProduitChange(value);
    });
  }

  private onProduitChange(produitId: number) {
    this.isProduit81 = (produitId === 81);


    const zoneCtrl = this.form.get('zone_id');


    if (!zoneCtrl ) return;

    if (this.isProduit81) {
      // 🔹 Produit 81 : on rend les champs invisibles + non obligatoires + vides
      zoneCtrl.setValue(null);
      zoneCtrl.clearValidators();

    } else {
      // 🔹 Autres produits : on peut remettre des validateurs si tu veux
      // Exemple : les rendre obligatoires
      // caCtrl.setValidators([Validators.required]);
      // zoneCtrl.setValidators([Validators.required]);
      // tauxCtrl.setValidators([Validators.required]);
    }

    zoneCtrl.updateValueAndValidity();
  }


  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  crud() {
    const formValue = this.form.value;

    const produitId = Number(formValue['produit']);

    // 👉 Si produit = 81, zone_id doit être null
    const zoneId =
      produitId === 81
        ? null
        : (formValue['zone_id'] != null && formValue['zone_id'] !== ''
        ? Number(formValue['zone_id'])
        : null);

    const dataFicheTechnique = {
      client: this.client?.id,
      direction: 1,
      utilisateur: '1',
      position: 1,
      commentaire: formValue['commentaire'],
      categorie_produit: this.fixeCategorie,
      produits_detail: [
        {
          produit: produitId,
          zone_id: zoneId,      // 🔹 ici on a bien null quand produit = 81
          quantite: 1
        },
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

    // Produits (JSON stringifié) => zone_id sera bien null dans le JSON
    formData.append('produits', JSON.stringify(dataFicheTechnique.produits_detail));

    const request$ =
      this.operation === this.operations.update
        ? this.ficheTechniquesService.update(this.ficheTechnique.id, formData)
        : this.ficheTechniquesService.create(formData);

    request$.subscribe(
      (data: FicheTechniques) => {
        this.msgMessageService.success('Fiche technique enregistrée avec succès');
        this.saveLocked = true;
        this.operation = this.operations.update;
        this.ficheTechnique = data;
      },
      (error) => {
        this.dialogService.alert({ message: error.message });
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
