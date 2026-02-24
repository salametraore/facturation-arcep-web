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
import { startWith, takeUntil ,finalize} from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';



@Component({
  selector: 'service-a-valeur-ajoute-crud',
  templateUrl: './service-a-valeur-ajoute-crud.component.html'
})
export class ServiceAValeurAjouteCrudComponent implements OnInit, AfterViewInit {

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
  historiqueFicheTechniques:HistoriqueFicheTechnique[];

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  saveLocked = false;

  transmitLocked = false;
  isTransmitting = false;

  private destroy$ = new Subject<void>();

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
  ) {
    this.t_FicheTechniquesProduits = new MatTableDataSource<FicheTechniqueProduit>([]);
  }

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

      // ✅ DATES
      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],

      // ✅ calculée => on désactive
      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin(); // calc immédiat
  }

  initFormCommandeClient_update() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client],
      commentaire: [this.ficheTechnique?.commentaire],

      // ✅ DATES
      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],
      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin();
  }

  private setupAutoDateFin() {
    const dateCtrl = this.form_ficheTechnique.get('date_debut');
    const dureeCtrl = this.form_ficheTechnique.get('duree');
    if (!dateCtrl || !dureeCtrl) return;

    combineLatest([
      dateCtrl.valueChanges.pipe(startWith(dateCtrl.value)),
      dureeCtrl.valueChanges.pipe(startWith(dureeCtrl.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDateFin());
  }

  updateDateFin() {
    const dateDebut = this.form_ficheTechnique.get('date_debut')?.value;
    const duree = this.form_ficheTechnique.get('duree')?.value;

    const dateFin = this.addMonthsSafe(dateDebut, duree);
    this.form_ficheTechnique.get('date_fin')?.setValue(dateFin, { emitEvent: false });
  }

  private addMonthsSafe(dateInput: any, monthsInput: any): Date | null {
    const d = this.toDateOrNull(dateInput);
    const m = Number(monthsInput);

    if (!d || !Number.isFinite(m)) return null;

    const day = d.getDate();

    // éviter les sauts fin de mois
    const res = new Date(d);
    res.setDate(1);
    res.setMonth(res.getMonth() + m);

    const lastDay = new Date(res.getFullYear(), res.getMonth() + 1, 0).getDate();
    res.setDate(Math.min(day, lastDay));

    return res;
  }

  private toDateOrNull(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    const d = new Date(v); // ISO 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
    return isNaN(d.getTime()) ? null : d;
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

  onPrint() {

  }

  private formatDateYYYYMMDD(input: any): string {
    if (!input) return '';

    // si c'est déjà une string ISO/date-only
    if (typeof input === 'string') {
      // "2026-02-24" ou "2026-02-24T..." => on garde YYYY-MM-DD
      return input.length >= 10 ? input.substring(0, 10) : input;
    }

    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

    const dDebut = this.form_ficheTechnique.get('date_debut')?.value;
    const dFin = this.form_ficheTechnique.get('date_fin')?.value;

    formData.append('date_debut', this.formatDateYYYYMMDD(dDebut));
    formData.append('duree', String(this.form_ficheTechnique.get('duree')?.value ?? ''));
    formData.append('date_fin', this.formatDateYYYYMMDD(dFin));

    // Produits (JSON stringifié)
    formData.append('produits', JSON.stringify(dataFicheTechnique.produits_detail));


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

}
