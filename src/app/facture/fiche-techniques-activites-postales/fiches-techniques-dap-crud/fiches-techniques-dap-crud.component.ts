import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {bouton_names, operations} from "../../../constantes";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {DialogService} from "../../../shared/services/dialog.service";
import {FicheTechniquesService} from "../../../shared/services/fiche-techniques.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ProduitService} from "../../../shared/services/produits.service";
import {FicheTechniques, MiseAJourStatutFiche} from "../../../shared/models/ficheTechniques";
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {Produit} from "../../../shared/models/produit";
import {AuthService} from "../../../authentication/auth.service";
import {ClientService} from "../../../shared/services/client.service";
import {Client} from "../../../shared/models/client";
import {WorkflowHistory} from "../../../shared/models/workflowHistory";
import {HistoriqueFicheTechnique} from "../../../shared/models/historique-traitement-fiche-technique";
import {MatTableDataSource} from "@angular/material/table";
import {FicheTechniqueProduit} from "../../../shared/models/ficheTechniquesProduits";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-domaine-crud',
  templateUrl: './fiches-techniques-dap-crud.component.html'
})
export class FichesTechniquesDapCrudComponent implements OnInit {

  ficheTechnique?: FicheTechniques;
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
  t_FicheTechniquesProduits?: MatTableDataSource<FicheTechniqueProduit>;
  historiqueFicheTechniques:HistoriqueFicheTechnique[];


 /* displayedColumns: string[] = ['produit','base_taxable','taux_postal','prix_unitaire','quantite', 'actions'];*/

  displayedColumns: string[] = ['produit_libelle','prix_unitaire','quantite'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  montant_de_la_commade: number = 0;


  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<FichesTechniquesDapCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.ficheTechnique = data.ficheTechnique;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
    this.t_FicheTechniquesProduits = new MatTableDataSource<FicheTechniqueProduit>([]);
  }

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
  }

  ngOnInit(): void {
    this.init();
    this.reloadData();
    if (this.ficheTechnique) {
      this.t_FicheTechniquesProduits.data = this.ficheTechnique?.produits_detail;
      console.log("Produits");
      console.log(this.ficheTechnique?.produits_detail);
    }
  }

  init() {
    if (this.ficheTechnique && (this.data_operation === this.operations.update||this.data_operation === this.operations.transmettre)) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.ficheTechnique && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.ficheTechnique && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  reloadData() {

    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
      if(this.ficheTechnique){
        this.client = clients?.find(c=>c.id ===this.ficheTechnique?.client);
        this.nomClient = this.client?.denomination_sociale;
      }
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits
        ?.filter(f => f.categorieProduit === this.fixeCategorie)
        .sort((a, b) => a.id - b.id);   // ✅ tri croissant
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
      produit: [this.ficheTechnique?.produits_detail[0].produit],
      commentaire: [this.ficheTechnique?.commentaire],
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
      produit: [],
      commentaire: [],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],
    });
  }

  crud() {
    const formValue = this.form.value;


    const dataFicheTechnique = {
      client: this.client?.id,
      direction: formValue['direction'],
      utilisateur: '1',
      position: formValue['position'],
      commentaire: formValue['commentaire'],
      categorie_produit: this.fixeCategorie,
      produits_detail: [
          {produit: Number(formValue['produit']), quantite: 1,"zone_id": null
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

    // Produits (JSON stringifié)
    formData.append('produits', JSON.stringify(dataFicheTechnique.produits_detail));

    // Upload fichiers
    /*    files.forEach(file => {
          formData.append('documents', file, file.name);
        });*/

    // Choisir la requête : création ou mise à jour
    const request$ =
      this.mode === operations.update
        ? this.ficheTechniquesService.update(this.ficheTechnique.id, formData)
        : this.ficheTechniquesService.create(formData);

    request$.subscribe(
      (data) => {
        this.msgMessageService.success('Fiche technique enregistrée avec succès');
        this.dialogRef.close('Yes');
      },
      (error) => {
        console.log(error);
        this.dialogService.alert({message: error.message});
        this.errorMessage = error.error?.message || error.message;
      }
    );
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
