// src/app/facture/frequences/modals/canal-frequences-dialog/canal-frequences-dialog.component.ts

import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Subject, of, merge } from 'rxjs';
import { takeUntil, switchMap, tap, catchError, distinctUntilChanged } from 'rxjs/operators';

import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { FicheTechniqueCanalRequest } from '../../../../shared/models/fiche-technique-frequence-create-request';

import { buildCanalFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeCanal } from '../../../../shared/models/typeCanal';
import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequence } from '../../../../shared/models/typeBandeFrequenceDetail';
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

  typeBandeFrequences: TypeBandeFrequence[] = [];
  typeCanaux: TypeCanal[] = [];
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

  // ✅ nbre_canaux (sera visible uniquement si config le permet => cat=4)
  showNbreCanaux = true;

  // ✅ code résolu (via API getItem)
  private selectedTypeStationCode: string | null = null;

  // ✅ mode édition ?
  private readonly isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CanalFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CanalDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private zoneCouvertureService: ZoneCouvertureService,
    private classeLargeurBande: ClasseLargeurBandeService,
  ) {
    this.isEditMode = !!data?.canal;
  }

  get canalCfg() {
    return this.cfg.canaux;
  }

  private isCat4(): boolean {
    return this.data?.cat === 4;
  }

  /**
   * ✅ Cat=4
   * nbre_tranche_facturation = largeur_bande_khz * nbre_canaux / 25
   * (retour entier avec CEIL, min=1)
   */
  private computeTranchesCat4(): number {
    const largeur = this.toNumber(this.form?.get('largeur_bande_khz')?.value) ?? 0;
    const canaux = Math.max(1, Math.floor(this.toNumber(this.form?.get('nbre_canaux')?.value) ?? 1));

    const raw = (largeur * canaux) / 25;

    // ✅ règle de rounding : CEIL + min 1
    return Math.max(1, Math.ceil(raw));
  }

  private applyCat4AutoCalc(): void {
    if (!this.isCat4()) return;

    const trancheCtrl = this.form.get('nbre_tranche_facturation');
    if (!trancheCtrl) return;

    // ✅ on bloque la saisie manuelle (calculé)
    trancheCtrl.disable({ emitEvent: false });

    const largeurCtrl = this.form.get('largeur_bande_khz');
    const canauxCtrl = this.form.get('nbre_canaux');

    // ✅ recalcul initial
    trancheCtrl.setValue(this.computeTranchesCat4(), { emitEvent: false });

    // ✅ recalcul à chaque changement de largeur / nbre_canaux
    merge(
      largeurCtrl?.valueChanges ?? of(null),
      canauxCtrl?.valueChanges ?? of(null),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        trancheCtrl.setValue(this.computeTranchesCat4(), { emitEvent: false });
      });
  }

  ngOnInit(): void {
    this.title = this.data.canal ? 'Modifier le canal' : 'Ajouter un canal';
    this.cfg = CATEGORY_CONFIG[this.data.cat];

    // ✅ form avec buildCanalFG => contient mode_duplexage, puissance_sortie, nbre_canaux, etc.
    this.form = buildCanalFG(this.fb, this.data.canal ?? {}, this.data.cat);

    // classe_largeur_bande calculée à partir de largeur_bande_khz (champ caché)
    bindCanalClasses(this.form, this.classeLargeurBande, this.destroy$);

    // IMPORTANT : charger les listes
    this.loadData();

    // ✅ Cat=4 => applique la formule + disable la saisie
    this.applyCat4AutoCalc();

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
        this.applyConditionalVisibilityAndValidators();
      });

    // ✅ première application
    const init = typeCtrl?.value;
    if (init != null) {
      typeCtrl?.setValue(init, { emitEvent: true });
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

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanal[]) => {
      this.typeCanaux = (listeCanaux ?? []).filter(tc => tc.categorie_produit === cat);
    });

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = (listeTypeStations ?? []).filter(ts => ts.categorie_produit === cat);
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequence[]) => {
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

    // ✅ sécurité : recalcul forcé avant sortie
    if (this.isCat4()) {
      const trancheCtrl = this.form.get('nbre_tranche_facturation');
      if (trancheCtrl) {
        trancheCtrl.enable({ emitEvent: false }); // pour que la valeur soit OK même si certains contrôles attendent enabled
        trancheCtrl.setValue(this.computeTranchesCat4(), { emitEvent: false });
        trancheCtrl.disable({ emitEvent: false });
      }
    }

    const value = this.form.getRawValue() as FicheTechniqueCanalRequest;
    this.dialogRef.close(value);
  }

  // -----------------------------
  // Visibilité côté template
  // -----------------------------
  private isCat345(): boolean {
    return this.data.cat === 3 || this.data.cat === 4 || this.data.cat === 5;
  }

  isTypeCanalVisible(): boolean {
    if (this.isCat345()) return this.showTypeCanal;
    const base = this.canalCfg?.type_canal?.visible !== false;
    return base && this.showTypeCanal;
  }

  isNbreCanauxVisible(): boolean {
    const base = this.canalCfg?.nbre_canaux?.visible !== false;
    return base && this.showNbreCanaux;
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

  private hideButKeepValue(ctrl: any): void {
    if (!ctrl) return;
    ctrl.clearValidators();
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

    const zoneCtrl = this.form.get('zone_couverture');
    const bandeCtrl = this.form.get('type_bande_frequence');
    const duplexCtrl = this.form.get('mode_duplexage');
    const puissanceCtrl = this.form.get('puissance_sortie');

    this.clearValidators(zoneCtrl);
    this.clearValidators(bandeCtrl);
    this.clearValidators(duplexCtrl);
    this.clearValidators(puissanceCtrl);

    if (cat === 3 || cat === 4) {
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
    } else if (cat === 5) {
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
      this.showZoneCouverture = true;
    } else {
      this.showTypeCanal = true;
      this.showNbreTrancheFact = true;
      this.showLargeurBandeKhz = true;
      this.showZoneCouverture = true;
      this.showTypeBandeFrequence = true;
      this.showModeDuplexage = true;
      this.showPuissanceSortie = true;
      return;
    }

    this.showTypeBandeFrequence = false;
    this.showModeDuplexage = false;
    this.showPuissanceSortie = false;

    this.showZoneCouverture = (cat === 5);

    if (!code) {
      if (this.isEditMode) {
        if (cat !== 5) this.hideButKeepValue(zoneCtrl);
        this.hideButKeepValue(bandeCtrl);
        this.hideButKeepValue(duplexCtrl);
        this.hideButKeepValue(puissanceCtrl);
      } else {
        if (cat !== 5) this.hideAndReset(zoneCtrl);
        this.hideAndReset(bandeCtrl);
        this.hideAndReset(duplexCtrl);
        this.hideAndReset(puissanceCtrl);
      }
      return;
    }

    // CAT = 3
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

    // CAT = 4
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

    // CAT = 5
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

  private toNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
}
