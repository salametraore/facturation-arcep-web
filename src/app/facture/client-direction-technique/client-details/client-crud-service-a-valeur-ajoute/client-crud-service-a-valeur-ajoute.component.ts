import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FicheTechniques, MiseAJourStatutFiche} from "../../../../shared/models/ficheTechniques";
import {Client} from "../../../../shared/models/client";
import {CategorieProduit} from "../../../../shared/models/categorie-produit";
import {StatutFicheTechnique} from "../../../../shared/models/statut-fiche-technique";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniqueProduit} from "../../../../shared/models/ficheTechniquesProduits";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Produit} from "../../../../shared/models/produit";
import {FicheTechniquesService} from "../../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../../shared/services/produits.service";
import {ClientService} from "../../../../shared/services/client.service";
import {StatutFicheTechniqueService} from "../../../../shared/services/statut-fiche-technique.service";
import {MsgMessageServiceService} from "../../../../shared/services/msg-message-service.service";
import {DialogService} from "../../../../shared/services/dialog.service";
import {operations,bouton_names} from "../../../../constantes";
import {HistoriqueFicheTechnique} from "../../../../shared/models/historique-traitement-fiche-technique";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'client-crud-service-a-valeur-ajoute',
  templateUrl: './client-crud-service-a-valeur-ajoute.component.html'
})
export class ClientCrudServiceAValeurAjouteComponent implements OnInit, AfterViewInit {

  fixeCategorie: number;
  ficheTechnique: FicheTechniques | undefined;
  operation: string;
  canAddProduit = true;
  nomClient: string;
  clientId: number;
  saveLocked = false;


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
  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  displayedColumns: string[] = ['produit','designation','quantite', 'actions'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  montant_de_la_commade: number = 0;
  produits: Produit[];

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private msgMessageService: MsgMessageServiceService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.t_FicheTechniquesProduits = new MatTableDataSource<FicheTechniqueProduit>([]);
  }

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
  }

  ngOnInit(): void {

    // 1) Récupérer clientId dans l’URL
    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));

    // 2) Récupérer operation, fixeCategorie, ficheId dans les query params
    const qp = this.route.snapshot.queryParamMap;

    this.operation = qp.get('op') || this.operations.create;
    this.fixeCategorie = Number(qp.get('cat')) || 14;

    const ficheId = Number(qp.get('ficheId'));

    // 3) Initialiser les formulaires AVANT les chargements async
    this.initFormCommandeClient_create();
    this.initFormFicheTechniquesProduit_create();

    // 4) Si on a un id de fiche, on la charge puis on remplit le formulaire
    if (ficheId) {
      this.ficheTechniquesService.getItem(ficheId).subscribe(ft => {
        this.ficheTechnique = ft;

        // lignes produits
        this.t_FicheTechniquesProduits.data = ft.produits_detail ?? [];

        // formulaire en mode update
        this.initFormCommandeClient_update();

        this.loadData();          // chargement clients / produits / statuts
        this.updateCanAddProduit();
      });
    } else {
      // mode création
      this.loadData();
      this.updateCanAddProduit();

      // pré-positionner le client (transmis dans l’URL)
      if (this.clientId) {
        this.form_ficheTechnique.patchValue({ client: this.clientId });
      }
    }
  }

  private updateCanAddProduit(): void {
    if (!this.ficheTechnique) {
      this.canAddProduit = true;
    } else {
      this.canAddProduit = (this.ficheTechnique.statut?.id ?? 1) < 4;
    }
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

      if (this.ficheTechnique) {
        this.client = clients?.find(c => c.id === this.ficheTechnique?.client);
        this.nomClient = this.client?.denomination_sociale;
        this.form_ficheTechnique.patchValue({ client: this.client?.id });
      } else if (this.clientId) {
        this.client = clients?.find(c => c.id === this.clientId);
        this.nomClient = this.client?.denomination_sociale;
        this.form_ficheTechnique.patchValue({ client: this.client?.id });
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f => f.categorieProduit === this.fixeCategorie);
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
      designation: [''],
      quantite: ['1'],
      produit: ['1'],
    });
  }

  onGetTotalLigne() {
    const formValue = this.form_ficheTechniquesProduit.value;
    if (formValue['quantite'] && formValue['prix_unitaire']) {
      const total = formValue['quantite'] * formValue['prix_unitaire'];
      this.form_ficheTechniquesProduit.get('total').setValue(total);
    }

  }

  onAdd() {
    const ficheTechniquesProduit: FicheTechniqueProduit = new FicheTechniqueProduit();
    const formValue = this.form_ficheTechniquesProduit.value;
    ficheTechniquesProduit.designation = formValue['designation'];
    ficheTechniquesProduit.quantite = formValue['quantite'];
    ficheTechniquesProduit.produit = formValue['produit'];
    console.log(ficheTechniquesProduit);
    this.add_ligneCommande(ficheTechniquesProduit);
    // if (this.t_FicheTechniquesProduits.data?.find(ap => (ap.designation === ficheTechniquesProduit.designation&&))) {
    //   this.dialogService.yes_no({
    //     title: 'Confirmation de modifiaction',
    //     message: 'Ce produit existe déjà dans la commande, voulez-vous le modifier  ?'
    //   }).subscribe(yes_no => {
    //     if (yes_no === true) {
    //       this.delete_ligneCommande(ficheTechniquesProduit);
    //       this.add_ligneCommande(ficheTechniquesProduit);
    //     }
    //   });
    // } else {
    //   this.add_ligneCommande(ficheTechniquesProduit);
    // }
  }

  add_ligneCommande(ficheTechniquesProduit: FicheTechniqueProduit) {
    // Ajouter l'élément à la liste existante
    this.t_FicheTechniquesProduits.data.push(ficheTechniquesProduit);

// Réaffecter le tableau mis à jour à la source de données
    this.t_FicheTechniquesProduits.data = [...this.t_FicheTechniquesProduits.data]; // Création d'une nouvelle référence
    this.initFormFicheTechniquesProduit_create();
    this.getMontantTotal([...this.t_FicheTechniquesProduits.data]);
  }

  onUpdate(ficheTechniquesProduit: FicheTechniqueProduit) {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [ficheTechniquesProduit?.id],
      designation: [ficheTechniquesProduit?.designation],
      quantite: [ficheTechniquesProduit?.quantite],
      prix_unitaire: [ficheTechniquesProduit?.prix_unitaire],
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

    const formData = new FormData();
    formData.append('client', String(dataFicheTechnique.client));
    formData.append('direction', String(dataFicheTechnique.direction));
    formData.append('utilisateur', String(dataFicheTechnique.utilisateur));
    formData.append('position', String(dataFicheTechnique.position));
    formData.append('commentaire', String(dataFicheTechnique.commentaire));
    formData.append('categorie_produit', String(dataFicheTechnique.categorie_produit));
    formData.append('objet', String(this.getCategorieProduit(dataFicheTechnique.categorie_produit)));
    formData.append('produits', JSON.stringify(dataFicheTechnique.produits_detail));

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
    this.router.navigate(
      ['/facture/client-direction-technique-detail', this.clientId]
    );
  }

  getProduit(id: number) {
    return this.produits.find(p => p.id === id)?.libelle;
  }

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
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

}
