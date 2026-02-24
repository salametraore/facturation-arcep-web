import {Component, Inject, OnInit} from '@angular/core';
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
import { OnDestroy } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil ,finalize} from 'rxjs/operators';

@Component({
  selector: 'app-domaine-crud',
  templateUrl: './domaine-crud.component.html'
})
export class DomaineCrudComponent implements OnInit {

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

  private destroy$ = new Subject<void>();

  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  transmitLocked = false;
  isTransmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<DomaineCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService,
  ) {
    this.ficheTechnique = data.ficheTechnique;
    this.data_operation = data.operation;
    this.fixeCategorie = data.fixeCategorie;
  }

  ngOnInit(): void {
    this.init();
    this.reloadData();
    console.log("ficheTechnique a afficher")
    console.log(this.ficheTechnique)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      produit: [this.ficheTechnique?.produits_detail?.[0]?.produit],
      commentaire: [this.ficheTechnique?.commentaire],
      direction: [2],
      statut: [1],
      position: [1],
      etat: ['INIT'],

      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],

      // ✅ calculée : on la désactive pour éviter la saisie manuelle
      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin(); // calc immédiat
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

      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],

      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin();
  }

  private setupAutoDateFin() {
    const dateCtrl = this.form.get('date_debut');
    const dureeCtrl = this.form.get('duree');

    if (!dateCtrl || !dureeCtrl) return;

    combineLatest([
      dateCtrl.valueChanges.pipe(startWith(dateCtrl.value)),
      dureeCtrl.valueChanges.pipe(startWith(dureeCtrl.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDateFin());
  }

  updateDateFin() {
    const dateDebut = this.form.get('date_debut')?.value;
    const duree = this.form.get('duree')?.value;

    const dateFin = this.addMonthsSafe(dateDebut, duree);

    // date_fin est disabled => setValue OK, mais il faut écrire sur le contrôle
    this.form.get('date_fin')?.setValue(dateFin, { emitEvent: false });
  }

  private addMonthsSafe(dateInput: any, monthsInput: any): Date | null {
    const d = this.toDateOrNull(dateInput);
    const m = Number(monthsInput);

    if (!d || !Number.isFinite(m)) return null;

    const day = d.getDate();

    // On se met au 1er du mois pour éviter les sauts (ex: 31 -> mois suivant)
    const res = new Date(d);
    res.setDate(1);
    res.setMonth(res.getMonth() + m);

    // Dernier jour du mois cible
    const lastDay = new Date(res.getFullYear(), res.getMonth() + 1, 0).getDate();
    res.setDate(Math.min(day, lastDay));

    return res;
  }

  private toDateOrNull(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    // ISO 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
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

  onTransmettre() {
    if (this.transmitLocked || this.isTransmitting) return;

    this.transmitLocked = true;   // lock immédiat anti double-clic
    this.isTransmitting = true;

    const miseAJourStatutFiche: MiseAJourStatutFiche = new MiseAJourStatutFiche();
    miseAJourStatutFiche.fiche_technique = this.ficheTechnique?.id;
    miseAJourStatutFiche.statut = 2;

    this.ficheTechniquesService.setStatutFiche(miseAJourStatutFiche)
      .pipe(
        finalize(() => {
          this.isTransmitting = false; // stop spinner
        })
      )
      .subscribe({
        next: (respone: MiseAJourStatutFiche) => {
          this.msgMessageService.success("Fiche transmise avec succès !");
          // ✅ on garde transmitLocked = true => bouton reste désactivé
        },
        error: (error) => {
          // ❌ erreur => on réactive pour permettre retry
          this.transmitLocked = false;

          this.dialogService.alert({
            message: error?.message ?? "Erreur lors de la transmission. Réessayez."
          });
        }
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
