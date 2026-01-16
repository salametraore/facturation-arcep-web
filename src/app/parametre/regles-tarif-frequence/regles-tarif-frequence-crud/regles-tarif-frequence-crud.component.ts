// src/app/features/parametrage/regles-tarif-frequence/regles-tarif-frequence-crud/regles-tarif-frequence-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import {
  RegleTarifFrequence,
  RegleTarifFrequenceRequest,
  ObjetEnum,
  NatureFraisEnum,
  UniteFacturationEnum,
  ScopePlafondEnum
} from '../../../shared/models/regle-tarif-frequence.model';

import { RegleTarifFrequenceService } from '../../../shared/services/regle-tarif-frequence.service';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { Produit } from '../../../shared/models/produit';
import { ProduitService } from '../../../shared/services/produits.service';

import { TypeStation } from '../../../shared/models/type-station';
import { TypeStationService } from '../../../shared/services/type-station.service';

import { TypeCanal } from '../../../shared/models/typeCanal';
import { TypeCanauxService } from '../../../shared/services/type-canaux.service';

import { TypeBandeFrequence } from '../../../shared/models/typeBandeFrequenceDetail';
import { TypeBandesFrequenceService } from '../../../shared/services/type-bandes-frequence.service';

// Ces référentiels ne sont pas fournis dans tes extraits.
// 👉 Tu peux soit les brancher plus tard, soit remplacer par des listes statiques.
import { ZoneCouvertureService } from '../../../shared/services/zone-couverture.service';
import { ClassePuissanceService } from '../../../shared/services/classe-puissance.service';
import { ClasseDebitService } from '../../../shared/services/classe-debit.service';
//import { CaractereRadioService } from '../../../shared/services/caractere-radio.service';
import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

export interface ReglesTarifFrequenceCrudData {
  regle?: RegleTarifFrequence | null;
  operation?: string; // create|update|details
}

@Component({
  selector: 'regles-tarif-frequence-crud',
  templateUrl: './regles-tarif-frequence-crud.component.html'
})
export class ReglesTarifFrequenceCrudComponent implements OnInit {

  regle?: RegleTarifFrequence;
  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' règle de tarification fréquence';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  // listes référentielles
  categorieProduits: CategorieProduit[] = [];
  produits: Produit[] = [];

  typeStations: TypeStation[] = [];
  typeCanaux: TypeCanal[] = [];
  typeBandes: TypeBandeFrequence[] = [];

  zones: any[] = [];
  classesPuissance: any[] = [];
  classesDebit: any[] = [];
  caracteresRadio: any[] = [];
  classesLargeurBande: any[] = [];

  // enums (pour mat-select)
  objets: ObjetEnum[] = ['STATION', 'CANAL'];
  natures: NatureFraisEnum[] = ['DOSSIER', 'GESTION', 'UTILISATION'];
  unites: UniteFacturationEnum[] = ['PAR_STATION', 'PAR_CANAL', 'PAR_TRANCHES', 'PAR_MHZ', 'PAR_RESEAU'];
  scopes: ScopePlafondEnum[] = ['DOSSIER', 'NATURE', 'PRODUIT'];

  constructor(
    private fb: FormBuilder,
    private regleService: RegleTarifFrequenceService,

    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,

    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private typeBandesService: TypeBandesFrequenceService,

    private zoneService: ZoneCouvertureService,
    private classePuissanceService: ClassePuissanceService,
    private classeDebitService: ClasseDebitService,
    //private caractereRadioService: CaractereRadioService,
    private classeLargeurBandeService: ClasseLargeurBandeService,

    private dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,

    public dialogRef: MatDialogRef<ReglesTarifFrequenceCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReglesTarifFrequenceCrudData
  ) {
    this.regle = data?.regle ?? undefined;
    this.data_operation = data?.operation ?? operations.create;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
    this.wireCascade();
  }

  init(): void {
    if (this.regle && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.regle && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.regle && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      this.form.disable(); // lecture seule
    }
    this.title = `${this.title} - ${this.window_name}`;
  }

  private initForm_update(): void {
    this.form = this.fb.group({
      id: [this.regle?.id],

      categorie_produit: [this.regle?.categorie_produit, Validators.required],
      produit: [this.regle?.produit, Validators.required],

      objet: [this.regle?.objet, Validators.required],
      nature_frais: [this.regle?.nature_frais, Validators.required],
      unite_facturation: [this.regle?.unite_facturation, Validators.required],

      nb_min: [this.regle?.nb_min],
      nb_max: [this.regle?.nb_max],

      montant_unitaire: [this.regle?.montant_unitaire],
      plafond_par_dossier: [this.regle?.plafond_par_dossier],
      montant_min_par_reseau: [this.regle?.montant_min_par_reseau],

      coeff_simplex: [this.regle?.coeff_simplex],
      coeff_zone: [this.regle?.coeff_zone],
      coeff_bande: [this.regle?.coeff_bande],
      coeff_global: [this.regle?.coeff_global],

      commentaire: [this.regle?.commentaire],
      priorite: [this.regle?.priorite],
      actif: [this.regle?.actif ?? true, Validators.required],
      scope_plafond: [this.regle?.scope_plafond],

      type_station: [this.regle?.type_station],
      type_canal: [this.regle?.type_canal],
      zone_couverture: [this.regle?.zone_couverture],
      type_bande_frequence: [this.regle?.type_bande_frequence],
      classe_puissance: [this.regle?.classe_puissance],
      classe_debit: [this.regle?.classe_debit],
      caractere_radio: [this.regle?.caractere_radio],
      classe_largeur_bande: [this.regle?.classe_largeur_bande],
    });
  }

  private initForm_create(): void {
    this.form = this.fb.group({
      id: [''],

      categorie_produit: [null, Validators.required],
      produit: [null, Validators.required],

      objet: [null, Validators.required],
      nature_frais: [null, Validators.required],
      unite_facturation: [null, Validators.required],

      nb_min: [null],
      nb_max: [null],

      montant_unitaire: [null],
      plafond_par_dossier: [null],
      montant_min_par_reseau: [null],

      coeff_simplex: [null],
      coeff_zone: [null],
      coeff_bande: [null],
      coeff_global: [null],

      commentaire: [''],
      priorite: [0],
      actif: [true, Validators.required],
      scope_plafond: [null],

      type_station: [null],
      type_canal: [null],
      zone_couverture: [null],
      type_bande_frequence: [null],
      classe_puissance: [null],
      classe_debit: [null],
      caractere_radio: [null],
      classe_largeur_bande: [null],
    });
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((rows) => (this.categorieProduits = rows ?? []));
    this.produitService.getListItems().subscribe((rows) => (this.produits = rows ?? []));

    this.typeStationService.getListItems().subscribe((rows) => (this.typeStations = rows ?? []));
    this.typeCanauxService.getListItems().subscribe((rows) => (this.typeCanaux = rows ?? []));
    this.typeBandesService.getListItems().subscribe((rows) => (this.typeBandes = rows ?? []));

    // référentiels optionnels (si services existent)
    this.zoneService.getListItems?.().subscribe?.((rows: any[]) => (this.zones = rows ?? []));
    this.classePuissanceService.getListItems?.().subscribe?.((rows: any[]) => (this.classesPuissance = rows ?? []));
    this.classeDebitService.getListItems?.().subscribe?.((rows: any[]) => (this.classesDebit = rows ?? []));
   // this.caractereRadioService.getListItems?.().subscribe?.((rows: any[]) => (this.caracteresRadio = rows ?? []));
    this.classeLargeurBandeService.getListItems?.().subscribe?.((rows: any[]) => (this.classesLargeurBande = rows ?? []));
  }

  private wireCascade(): void {
    // si tu veux filtrer les produits par catégorie (optionnel)
    this.form?.get('categorie_produit')?.valueChanges?.subscribe((catId) => {
      // si ta liste produit contient categorieProduit (ou categorie_produit) adapte ici
      // sinon, laisse tout et ne filtre pas.
      // this.produits = (this.produitsAll ?? []).filter(p => p.categorieProduit === catId);
      // reset produit si plus cohérent
      if (this.form.get('produit')?.value) this.form.get('produit')?.setValue(null);
    });
  }

  private toRequest(): RegleTarifFrequenceRequest {
    const v = this.form.value;

    const req: RegleTarifFrequenceRequest = {
      categorie_produit: v.categorie_produit,
      produit: v.produit,

      objet: v.objet,
      nature_frais: v.nature_frais,
      unite_facturation: v.unite_facturation,

      nb_min: v.nb_min,
      nb_max: v.nb_max,

      montant_unitaire: v.montant_unitaire,
      plafond_par_dossier: v.plafond_par_dossier,
      montant_min_par_reseau: v.montant_min_par_reseau,

      coeff_simplex: v.coeff_simplex,
      coeff_zone: v.coeff_zone,
      coeff_bande: v.coeff_bande,
      coeff_global: v.coeff_global,

      commentaire: v.commentaire,
      priorite: v.priorite,
      actif: v.actif,
      scope_plafond: v.scope_plafond,

      type_station: v.type_station,
      type_canal: v.type_canal,
      zone_couverture: v.zone_couverture,
      type_bande_frequence: v.type_bande_frequence,
      classe_puissance: v.classe_puissance,
      classe_debit: v.classe_debit,
      caractere_radio: v.caractere_radio,
      classe_largeur_bande: v.classe_largeur_bande,
    };

    return req;
  }

  crud(): void {
    const id = this.form.value?.id;

    const payload = this.toRequest();

    if (this.mode === operations.update) {
      this.regleService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Règle enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    } else if (this.mode === operations.create) {
      this.regleService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Règle enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    }
  }

  // ---- affichage libellés (si *_detail pas dispo dans les listes) ----
  getCategorieLabel(id: any): string {
    return this.categorieProduits?.find((c) => c.id === id)?.libelle ?? '';
  }

  getProduitLabel(id: any): string {
    return this.produits?.find((p) => p.id === id)?.libelle ?? (this.produits?.find((p) => p.id === id) as any)?.code ?? '';
  }

  getTypeStationLabel(id: any): string {
    return this.typeStations?.find((x) => x.id === id)?.libelle ?? '';
  }

  getTypeCanalLabel(id: any): string {
    return this.typeCanaux?.find((x) => x.id === id)?.libelle ?? '';
  }

  getTypeBandeLabel(id: any): string {
    return this.typeBandes?.find((x) => x.id === id)?.libelle ?? '';
  }

  labelObjet(v?: ObjetEnum): string {
    return v === 'STATION' ? 'Station' : v === 'CANAL' ? 'Canal' : '';
  }

  labelNature(v?: NatureFraisEnum): string {
    switch (v) {
      case 'DOSSIER': return 'Frais de dossier';
      case 'GESTION': return 'Redevance de gestion';
      case 'UTILISATION': return 'Redevance d’utilisation';
      default: return '';
    }
  }

  labelUnite(v?: UniteFacturationEnum): string {
    switch (v) {
      case 'PAR_STATION': return 'Par station';
      case 'PAR_CANAL': return 'Par canal';
      case 'PAR_TRANCHES': return 'Par tranches';
      case 'PAR_MHZ': return 'Par MHz';
      case 'PAR_RESEAU': return 'Par réseau';
      default: return '';
    }
  }

  labelScope(v?: ScopePlafondEnum): string {
    switch (v) {
      case 'DOSSIER': return 'Par dossier';
      case 'NATURE': return 'Par nature';
      case 'PRODUIT': return 'Par produit';
      default: return '';
    }
  }
}
