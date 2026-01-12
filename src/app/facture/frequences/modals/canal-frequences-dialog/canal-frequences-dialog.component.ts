// src/app/facture/frequences/modals/canal-frequences-dialog/canal-frequences-dialog.component.ts

import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap, catchError, distinctUntilChanged } from 'rxjs/operators';

import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { FicheTechniqueCanalRequest } from '../../../../shared/models/fiche-technique-frequence-create-request';

import { buildCanalFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeCanalList } from '../../../../shared/models/typeCanalList';
import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequenceList } from '../../../../shared/models/typeBandeFrequenceList';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';
import { TypeCanauxService } from '../../../../shared/services/type-canaux.service';
import { ZoneCouverture } from '../../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../../shared/services/zone-couverture.service';

import { ClasseLargeurBandeService } from '../../../../shared/services/classe-largeur-bande.service';
import { bindCanalClasses } from '../../forms/canal-classes-binder';

export interface CanalDialogData {
  canal?: FicheTechniqueCanalRequest;
  cat: CategoryId;
}

@Component({
  selector: 'app-canal-frequences-dialog',
  templateUrl: './canal-frequences-dialog.component.html'
})
export class CanalFrequencesDialogComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  title = 'Ajouter un canal';

  cfg = CATEGORY_CONFIG[1 as CategoryId];
  private destroy$ = new Subject<void>();

  typeBandeFrequences: TypeBandeFrequenceList[] = [];
  typeCanaux: TypeCanalList[] = [];
  typeStations: TypeStation[] = [];
  zoneCouvertures: ZoneCouverture[] = [];

  duplexModes = [
    { value: 'FDD', label: 'FDD' },
    { value: 'TDD', label: 'TDD' },
  ];

  // flags d’affichage conditionnel
  showTypeCanal = true;
  showNbreTrancheFact = true;
  showLargeurBandeKhz = true;

  showZoneCouverture = false;
  showTypeBandeFrequence = false;
  showModeDuplexage = false;
  showPuissanceSortie = false;

  // ✅ code résolu (via API getItem)
  private selectedTypeStationCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CanalFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CanalDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private zoneCouvertureService: ZoneCouvertureService,
    private classeLargeurBande: ClasseLargeurBandeService,
  ) {}

  get canalCfg() {
    return this.cfg.canaux;
  }

  ngOnInit(): void {
    this.title = this.data.canal ? 'Modifier le canal' : 'Ajouter un canal';
    this.cfg = CATEGORY_CONFIG[this.data.cat];

    this.form = buildCanalFG(this.fb, this.data.canal ?? {}, this.data.cat);

    // classe_largeur_bande calculée à partir de largeur_bande_khz (champ caché)
    bindCanalClasses(this.form, this.classeLargeurBande, this.destroy$);

    // IMPORTANT : charger les listes
    this.loadData();

    // ✅ écoute changement type_station (id) -> getItem(id) -> code -> apply règles
    const typeCtrl = this.form.get('type_station');

    typeCtrl?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        switchMap((rawId) => {
          const id = Number(rawId);

          if (!id || Number.isNaN(id)) {
            this.selectedTypeStationCode = null;
            return of(null);
          }

          // ✅ Récupère TypeStation complet (avec code) via API
          return this.typeStationService.getItem(id).pipe(
            tap((ts) => {
              this.selectedTypeStationCode = ts?.code ?? null;
            }),
            catchError((e) => {
              console.error('getItem(type_station) failed', e);
              this.selectedTypeStationCode = null;
              return of(null);
            })
          );
        })
      )
      .subscribe(() => {
        console.log('type_station=', typeCtrl?.value, 'code=', this.selectedTypeStationCode, 'cat=', this.data.cat);
        this.applyConditionalVisibilityAndValidators();
      });

    // 1ère application (édition / valeur déjà présente)
    // Si on est en mode édition, on déclenche manuellement le flux
    const init = typeCtrl?.value;
    if (init != null) {
      typeCtrl?.setValue(init); // relance valueChanges (et donc getItem)
    } else {
      this.applyConditionalVisibilityAndValidators();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    const cat = this.data.cat;

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanalList[]) => {
      this.typeCanaux = (listeCanaux ?? []).filter(tc => tc.categorie_produit === cat);

      // re-apply : permet setTypeCanalByCode quand liste dispo (cat 5)
      this.applyConditionalVisibilityAndValidators();
    });

    // On garde la liste pour l'affichage (libellés)
    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = (listeTypeStations ?? []).filter(ts => ts.categorie_produit === cat);
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
      this.typeBandeFrequences = (listeTypeBandesFreq ?? []).filter(bf => bf.categorie_produit === cat);
    });

    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = (listeZones ?? []).filter(z => z.categorie_produit === 2);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue() as FicheTechniqueCanalRequest;
    this.dialogRef.close(value);
  }

  // -----------------------------
  // Visibilité côté template
  // => pour cat 3/4/5 : on FORCE la visibilité via flags (même si cfg.visible=false)
  // -----------------------------
  private isCat345(): boolean {
    return this.data.cat === 3 || this.data.cat === 4 || this.data.cat === 5;
  }

  isTypeCanalVisible(): boolean {
    if (this.isCat345()) return this.showTypeCanal;
    const base = this.canalCfg?.type_canal?.visible !== false;
    return base && this.showTypeCanal;
  }

  isNbreTrancheVisible(): boolean {
    if (this.isCat345()) return this.showNbreTrancheFact;
    const base = this.canalCfg?.nbre_tranche_facturation?.visible !== false;
    return base && this.showNbreTrancheFact;
  }

  isLargeurBandeKhzVisible(): boolean {
    if (this.isCat345()) return this.showLargeurBandeKhz;
    const base = this.canalCfg?.largeur_bande_khz?.visible !== false;
    return base && this.showLargeurBandeKhz;
  }

  isZoneCouvertureVisible(): boolean {
    if (this.isCat345()) return this.showZoneCouverture;
    const base = this.canalCfg?.zone_couverture?.visible !== false;
    return base && this.showZoneCouverture;
  }

  isTypeBandeFrequenceVisible(): boolean {
    if (this.isCat345()) return this.showTypeBandeFrequence;
    const base = this.canalCfg?.type_bande_frequence?.visible !== false;
    return base && this.showTypeBandeFrequence;
  }

  isModeDuplexageVisible(): boolean {
    if (this.isCat345()) return this.showModeDuplexage;
    const base = this.canalCfg?.mode_duplexage?.visible !== false;
    return base && this.showModeDuplexage;
  }

  isPuissanceSortieVisible(): boolean {
    if (this.isCat345()) return this.showPuissanceSortie;
    const base = this.canalCfg?.puissance_sortie?.visible !== false;
    return base && this.showPuissanceSortie;
  }

  private getSelectedTypeStationCode(): string | null {
    return this.selectedTypeStationCode;
  }

  // -----------------------------
  // Validators helpers
  // -----------------------------
  private clearValidators(ctrl: any): void {
    if (!ctrl) return;
    ctrl.clearValidators();
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private require(ctrl: any): void {
    if (!ctrl) return;
    ctrl.setValidators([Validators.required]);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private hideAndReset(ctrl: any): void {
    if (!ctrl) return;
    ctrl.clearValidators();
    ctrl.setValue(null, { emitEvent: false });
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private setTypeCanalByCode(code: string): void {
    const ctrl = this.form.get('type_canal');
    if (!ctrl) return;

    const target = (this.typeCanaux ?? []).find(tc => tc.code === code);
    if (target?.id != null) {
      ctrl.setValue(target.id, { emitEvent: false });
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // -----------------------------
  // Règles métier cat 3/4/5
  // -----------------------------
  private applyConditionalVisibilityAndValidators(): void {
    const cat = this.data.cat;
    const code = this.getSelectedTypeStationCode();

    console.log('type_station.code =', code, 'cat=', cat);

    const zoneCtrl = this.form.get('zone_couverture');
    const bandeCtrl = this.form.get('type_bande_frequence');
    const duplexCtrl = this.form.get('mode_duplexage');
    const puissanceCtrl = this.form.get('puissance_sortie');

    // d'abord : nettoyer uniquement les validators (sans effacer les valeurs)
    this.clearValidators(zoneCtrl);
    this.clearValidators(bandeCtrl);
    this.clearValidators(duplexCtrl);
    this.clearValidators(puissanceCtrl);

    // defaults (cat 3/4/5 : d’office)
    if (cat === 3 || cat === 4) {
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
    } else if (cat === 5) {
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
      this.showZoneCouverture = true; // d'office
    } else {
      // autres catégories : on ne gère pas ici
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
      this.showZoneCouverture = true;
      this.showTypeBandeFrequence = true;
      this.showModeDuplexage = true;
      this.showPuissanceSortie = true;
      return;
    }

    // reset des champs conditionnels (cat 3/4/5)
    this.showTypeBandeFrequence = false;
    this.showModeDuplexage = false;
    this.showPuissanceSortie = false;

    // zone couverture : false sauf cat5 (d’office) ou règles
    this.showZoneCouverture = (cat === 5);

    // si aucun code (pas encore résolu), on cache tout sauf d’office
    if (!code) {
      if (cat !== 5) this.hideAndReset(zoneCtrl);
      this.hideAndReset(bandeCtrl);
      this.hideAndReset(duplexCtrl);
      this.hideAndReset(puissanceCtrl);
      return;
    }

    // =========================
    // CAT = 3
    // =========================
    if (cat === 3) {
      if (code === 'TS_TRUNK_BASE') {
        this.showZoneCouverture = true;
        this.require(zoneCtrl);

        this.hideAndReset(bandeCtrl);
        this.hideAndReset(duplexCtrl);
        this.hideAndReset(puissanceCtrl);
        return;
      }

      if (code === 'TS_CELL_BASE') {
        this.showZoneCouverture = true;
        this.showTypeBandeFrequence = true;
        this.showModeDuplexage = true;

        this.require(zoneCtrl);
        this.require(bandeCtrl);
        this.require(duplexCtrl);

        this.hideAndReset(puissanceCtrl);
        return;
      }

      this.hideAndReset(zoneCtrl);
      this.hideAndReset(bandeCtrl);
      this.hideAndReset(duplexCtrl);
      this.hideAndReset(puissanceCtrl);
      return;
    }

    // =========================
    // CAT = 4
    // =========================
    if (cat === 4) {
      if (code === 'TS_MF_HF') {
        this.showPuissanceSortie = true;
        this.require(puissanceCtrl);

        this.hideAndReset(zoneCtrl);
        this.hideAndReset(bandeCtrl);
        this.hideAndReset(duplexCtrl);
        return;
      }

      if (code === 'TS_PMP_BOUCLE') {
        this.showZoneCouverture = true;
        this.showModeDuplexage = true;

        this.require(zoneCtrl);
        this.require(duplexCtrl);

        this.hideAndReset(bandeCtrl);
        this.hideAndReset(puissanceCtrl);
        return;
      }

      if (code === 'TS_P2P_GT30') {
        this.showZoneCouverture = true;
        this.showTypeBandeFrequence = true;

        this.require(zoneCtrl);
        this.require(bandeCtrl);

        this.hideAndReset(duplexCtrl);
        this.hideAndReset(puissanceCtrl);
        return;
      }

      this.hideAndReset(zoneCtrl);
      this.hideAndReset(bandeCtrl);
      this.hideAndReset(duplexCtrl);
      this.hideAndReset(puissanceCtrl);
      return;
    }

    // =========================
    // CAT = 5
    // =========================
    if (cat === 5) {
      if (code === 'TS_RADIO_AN' || code === 'TS_RADIO_MUX') {
        this.setTypeCanalByCode('TC_RADIO');

        this.showPuissanceSortie = true;
        this.require(puissanceCtrl);
        return;
      }

      if (code === 'TS_TV_AN' || code === 'TS_TV_NUM' || code === 'TS_MMDS') {
        this.setTypeCanalByCode('TC_VIDEO8');
        this.hideAndReset(puissanceCtrl);
        return;
      }

      this.hideAndReset(puissanceCtrl);
      return;
    }
  }
}
