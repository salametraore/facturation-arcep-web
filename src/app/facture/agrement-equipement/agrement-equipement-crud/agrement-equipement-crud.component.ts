import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FicheTechniques, MiseAJourStatutFiche} from "../../../shared/models/ficheTechniques";
import {Client} from "../../../shared/models/client";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {StatutFicheTechnique} from "../../../shared/models/statut-fiche-technique";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniqueProduit} from "../../../shared/models/ficheTechniquesProduits";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Produit} from "../../../shared/models/produit";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {ClientService} from "../../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../../shared/services/statut-fiche-technique.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {DialogService} from "../../../shared/services/dialog.service";
import {operations,bouton_names} from "../../../constantes";
import {HistoriqueFicheTechnique} from "../../../shared/models/historique-traitement-fiche-technique";



@Component({
  selector: 'agrement-equipement-crud',
  templateUrl: './agrement-equipement-crud.component.html'
})
export class AgrementEquipementCrudComponent implements OnInit, AfterViewInit {

  @Input() fixeCategorie: number;
  @Input() ficheTechnique: FicheTechniques;
  @Input() operation: string;
  @Output() notifyFicheTechnique: EventEmitter<FicheTechniques> = new EventEmitter<FicheTechniques>();
  @Output() notifyActionOperation: EventEmitter<string> = new EventEmitter<string>();
  clients: Client[];
  client: Client;
  categories: CategorieProduit[];
  categorie: CategorieProduit;
  statutFicheTechniques: StatutFicheTechnique[];
  statutFicheTechnique: StatutFicheTechnique;
  form_ficheTechnique: FormGroup;
  form_ficheTechniquesProduit: FormGroup;
  t_FicheTechniquesProduits?: MatTableDataSource<FicheTechniqueProduit>;

  saveLocked = false;

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';


  displayedColumns: string[] = ['produit','marque','modele', 'actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  montant_de_la_commade: number = 0;
  produits: Produit[];
  productAllowedIds = [72, 73, 74];
  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  // IDs des 3 "produits" d'agrément
  private readonly PRODUCT_BASE_ID = 72;
  private readonly PRODUCT_RADIO_ID = 73;
  private readonly PRODUCT_TERMINAL_ID = 74;

  // utilitaires
  private isBase = (id: number) => id === this.PRODUCT_BASE_ID;
  private isRadio = (id: number) => id === this.PRODUCT_RADIO_ID;
  private isTerminal = (id: number) => id === this.PRODUCT_TERMINAL_ID;

  private hasProductInTable = (productId: number): boolean =>
    this.t_FicheTechniquesProduits.data?.some(r => r.produit === productId) ?? false;

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private msgMessageService: MsgMessageServiceService,
    private dialogService: DialogService,
  ) {
    this.t_FicheTechniquesProduits = new MatTableDataSource<FicheTechniqueProduit>([]);
  }

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
  }

  ngOnInit(): void {
    console.log(this.ficheTechnique)
    this.loadData();
    this.initFormCommandeClient_create();
    this.initFormFicheTechniquesProduit_create();
    if (this.ficheTechnique) {
      this.t_FicheTechniquesProduits.data = this.ficheTechnique?.produits_detail;
      this.initFormCommandeClient_update();
    }

    console.log(this.ficheTechnique);
  }

  loadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });
    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
      this.statutFicheTechnique = statutFicheTechniques.find(st => st.id === 1);
    });
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });


    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(p =>
        p.categorieProduit === this.fixeCategorie &&
        this.productAllowedIds.includes(p.id)
      );

      // 1) Pré-sélectionner "base" dans le formulaire d'ajout
      if (this.produits.some(p => p.id === this.PRODUCT_BASE_ID)) {
        this.form_ficheTechniquesProduit.patchValue({ produit: this.PRODUCT_BASE_ID });
      }

      // 2) Si création (pas de ficheTechnique) et tableau vide => ajouter la ligne "base"
      if (!this.ficheTechnique || !this.ficheTechnique?.produits_detail?.length) {
        if (!this.hasProductInTable(this.PRODUCT_BASE_ID)) {
          this.add_ligneCommande(this.getBaseRowTemplate());
        }
      } else {
        // Cas édition : s'il existe Radio/Terminal sans Base, on ajoute la Base
        const hasRadio = this.ficheTechnique.produits_detail.some(d => d.produit === this.PRODUCT_RADIO_ID);
        const hasTerminal = this.ficheTechnique.produits_detail.some(d => d.produit === this.PRODUCT_TERMINAL_ID);
        const hasBase = this.ficheTechnique.produits_detail.some(d => d.produit === this.PRODUCT_BASE_ID);
        if ((hasRadio || hasTerminal) && !hasBase) {
          this.add_ligneCommande(this.getBaseRowTemplate());
        }
      }


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

  onTransmettre(){
    const miseAJourStatutFiche:MiseAJourStatutFiche = new MiseAJourStatutFiche();
    miseAJourStatutFiche.fiche_technique = this.ficheTechnique?.id;
    miseAJourStatutFiche.statut = 2;
    this.ficheTechniquesService.setStatutFiche(miseAJourStatutFiche).subscribe((respone:MiseAJourStatutFiche)=>{
      this.msgMessageService.success("Fiche transmise avec succès !");
    },error => {
      this.dialogService.alert({message:error.message});
    });
  }


  initFormCommandeClient_create() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client],
      commentaire: [],
    });
  }

  initFormCommandeClient_update() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client],
      commentaire: [this.ficheTechnique?.commentaire],
    });
  }

  onGetClient(item: Client) {
    this.client = item;
  }

  initFormFicheTechniquesProduit_create() {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [''],
      marque: [''],
      modele: [''],
      quantite: ['1'],
      produit: [''],
    });
  }


  private getBaseRowTemplate(): FicheTechniqueProduit {
    const r = new FicheTechniqueProduit();
    r.produit = this.PRODUCT_BASE_ID;
    r.marque = this.form_ficheTechniquesProduit.get('marque')?.value || '';
    r.modele = this.form_ficheTechniquesProduit.get('modele')?.value || '';
    r.quantite = 1;
    return r;
  }

  onAdd() {
    const formValue = this.form_ficheTechniquesProduit.value;
    const selectedProductId = +formValue['produit'];

    // 0) garde-fous
    if (!selectedProductId) { return; }

    // 1) si l'utilisateur ajoute Radio/Terminal, s'assurer que "base" est présent
    if (this.isRadio(selectedProductId) || this.isTerminal(selectedProductId)) {
      if (!this.hasProductInTable(this.PRODUCT_BASE_ID)) {
        this.add_ligneCommande(this.getBaseRowTemplate());
      }
    }

    // 2) éviter les doublons exacts de produit (optionnel: tu peux raffiner par marque/modèle)
    const alreadyExists = this.t_FicheTechniquesProduits.data
      .some(r => r.produit === selectedProductId
        && r.marque === formValue['marque']
        && r.modele === formValue['modele']);

    if (alreadyExists) {
      this.msgMessageService.failed('Cet élément existe déjà dans la liste.');
      return;
    }

    // 3) éviter d’ajouter "base" plusieurs fois
    if (this.isBase(selectedProductId) && this.hasProductInTable(this.PRODUCT_BASE_ID)) {
      this.msgMessageService.failed('Le forfait de base est déjà présent.');
      return;
    }

    // 4) construire et ajouter la ligne sélectionnée
    const ficheTechniquesProduit: FicheTechniqueProduit = new FicheTechniqueProduit();
    ficheTechniquesProduit.marque = formValue['marque'];
    ficheTechniquesProduit.modele = formValue['modele'];
    ficheTechniquesProduit.quantite = +formValue['quantite'] || 1;
    ficheTechniquesProduit.produit = selectedProductId;

    this.add_ligneCommande(ficheTechniquesProduit);
  }

  add_ligneCommande(ficheTechniquesProduit: FicheTechniqueProduit) {
    this.t_FicheTechniquesProduits.data.push(ficheTechniquesProduit);
    this.t_FicheTechniquesProduits.data = [...this.t_FicheTechniquesProduits.data];
    this.initFormFicheTechniquesProduit_create();

    // conserver la sélection par défaut
    this.form_ficheTechniquesProduit.patchValue({ produit: this.PRODUCT_BASE_ID });

    this.getMontantTotal([...this.t_FicheTechniquesProduits.data]);
  }


  onUpdate(ficheTechniquesProduit: FicheTechniqueProduit) {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [ficheTechniquesProduit?.id],
      marque: [ficheTechniquesProduit?.marque],
      modele: [ficheTechniquesProduit?.modele],
      quantite: [ficheTechniquesProduit?.quantite],
      prix_unitaire: [ficheTechniquesProduit?.prix_unitaire],
    });
  }

  onDelete(row: FicheTechniqueProduit) {
    this.dialogService.yes_no({
      title: 'Confirmation de la suppression',
      message: 'Confirmez-vous supprimer cet élément ?'
    }).subscribe(yes => {
      if (yes) {
        const idx = this.t_FicheTechniquesProduits.data.indexOf(row);
        if (idx >= 0) {
          const copy = [...this.t_FicheTechniquesProduits.data];
          copy.splice(idx, 1);
          this.t_FicheTechniquesProduits.data = copy;
          this.getMontantTotal(copy);
        }
      }
    });
  }


  delete_ligneCommande(ficheTechniquesProduit: FicheTechniqueProduit) {
    this.t_FicheTechniquesProduits.data = this.t_FicheTechniquesProduits.data.filter(p => p.id !== ficheTechniquesProduit.id);
    // Rafraîchir la table
    this.t_FicheTechniquesProduits._updateChangeSubscription();
    this.getMontantTotal([...this.t_FicheTechniquesProduits.data]);
  }

  getMontantTotal(ficheTechniquesProduits: FicheTechniqueProduit[]) {
    this.montant_de_la_commade = 0;
    if (ficheTechniquesProduits?.length > 0) {
      this.t_FicheTechniquesProduits.data.forEach((ficheTechniquesProduit: FicheTechniqueProduit) => {
        this.montant_de_la_commade += ficheTechniquesProduit.quantite * ficheTechniquesProduit.prix_unitaire;
      });
    } else {
      return 0;
    }
  }

  onPrint() {

  }

  onSave() {
    const formValue = this.form_ficheTechnique.value;


    const dataFicheTechnique: FicheTechniques = {
      client: formValue['client'],
      direction: 1,
      utilisateur: 1,
      position: 1,
      commentaire: formValue['commentaire'],
      categorie_produit: this.fixeCategorie,
      produits_detail: this.t_FicheTechniquesProduits?.data,
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

  onRetour() {
    this.notifyActionOperation.emit(operations.table);
    this.ficheTechnique = undefined;
    this.notifyFicheTechnique.emit(this.ficheTechnique);
  }

  getProduit(id: number) {
    return this.produits.find(p => p.id === id)?.libelle;
  }

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  getProduitsLibelles(fiche: FicheTechniques | null | undefined): string {
    console.log("fiche");
    console.log(fiche);
    if (!fiche || !fiche.produits_detail || fiche.produits_detail.length === 0) {
      return '';
    }

    return fiche.produits_detail
      .map(p => this.getProduit(p.produit))
      .filter((lib): lib is string => !!lib && lib.trim().length > 0)
      .join(', ');
  }
}
