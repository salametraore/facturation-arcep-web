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

import { TypeCanal } from '../../../../shared/models/typeCanal';
import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequence } from '../../../../shared/models/typeBandeFrequenceDetail';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';
import { TypeCanauxService } from '../../../../shared/services/type-canaux.service';
import { ZoneCouverture } from '../../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../../shared/services/zone-couverture.service';

import { ClasseLargeurBandeService } from '../../../../shared/services/classe-largeur-bande.service';
import { ClassePuissanceService } from '../../../../shared/services/classe-puissance.service'; // ✅ NEW
import { bindCanalClasses } from '../../forms/canal-classes-binder';

import { CaractereRadio } from '../../../../shared/models/caractere-radio.model';
import { CaractereRadioService } from '../../../../shared/services/caractere-radio.service';

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
  caractereRadios: CaractereRadio[] = [];
  caractereRadio!: CaractereRadio;

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

  // ✅ nbre_canaux désormais obligatoire partout
  showNbreCanaux = true;

  // ✅ codes résolus
  private selectedTypeStationCode: string | null = null;
  private selectedTypeCanalCode: string | null = null;

  // ✅ mode édition ?
  private readonly isEditMode: boolean;

  // ✅ uniquement pour le hint (pas de calcul ici !)
  private readonly DUPLEX_CODES = new Set<string>([
    'TC_CRED_PUBLIC',
    'TC_PMR3_MOBILE',
    'TC_PMR_FIXE',
  ]);

  private readonly SIMPLEXE_CODES = new Set<string>([
    'TC_PMR2_MOBILE',
  ]);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CanalFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CanalDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private zoneCouvertureService: ZoneCouvertureService,
    private caractereRadioService: CaractereRadioService,
    private classeLargeurBande: ClasseLargeurBandeService,
    private classePuissance: ClassePuissanceService, // ✅ NEW
  ) {
    this.isEditMode = !!data?.canal;
  }

  get canalCfg() {
    return this.cfg.canaux;
  }

  // ✅ hint dynamique selon code type canal
  get trancheHint(): string {
    const code = this.selectedTypeCanalCode;
    if (code && this.DUPLEX_CODES.has(code)) {
      return 'Calcul automatique : tranches = (nb canaux × largeur) / 25';
    }
    if (code && this.SIMPLEXE_CODES.has(code)) {
      return 'Calcul automatique : tranches = (nb canaux × largeur) / 12,5';
    }
    return 'Calcul automatique : tranches = nb canaux';
  }

  ngOnInit(): void {
    this.title = this.data.canal ? 'Modifier le canal' : 'Ajouter un canal';
    this.cfg = CATEGORY_CONFIG[this.data.cat];

    // ✅ FG : le calcul des tranches est fait dans buildCanalFG()
    this.form = buildCanalFG(this.fb, this.data.canal ?? {}, this.data.cat);

    // ✅ sécurité : nbre_canaux obligatoire partout
    const nbreCanauxCtrl = this.form.get('nbre_canaux');
    if (nbreCanauxCtrl) {
      nbreCanauxCtrl.setValidators([Validators.required, Validators.min(1)]);
      nbreCanauxCtrl.updateValueAndValidity({ emitEvent: false });

      if (nbreCanauxCtrl.value == null || nbreCanauxCtrl.value === '') {
        nbreCanauxCtrl.setValue(1, { emitEvent: false });
      }
    }

    // ✅ classes auto:
    // - largeur_bande_khz => classe_largeur_bande
    // - puissance_sortie  => classe_puissance_id
    bindCanalClasses(
      this.form,
      this.classeLargeurBande,
      this.classePuissance,
      this.destroy$
    );

    // ✅ charger les listes
    this.loadData();

    // ✅ règles selon type station (inchangé)
    this.listenTypeStationChanges();

    // ✅ IMPORTANT : type_canal (ID) => type_canal_code (string)
    this.listenTypeCanalChanges();

    // ✅ première application des règles UI
    const typeStationCtrl = this.form.get('type_station');
    const initStation = typeStationCtrl?.value;

    if (initStation != null) {
      typeStationCtrl?.setValue(initStation, { emitEvent: true });
    } else {
      this.applyConditionalVisibilityAndValidators();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ------------------------------------------------
  // ✅ Synchronisation type_canal -> type_canal_code
  // ------------------------------------------------
  private listenTypeCanalChanges(): void {
    const typeCanalCtrl = this.form.get('type_canal');

    typeCanalCtrl?.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((rawId) => {
        const id = Number(rawId);
        if (!id || Number.isNaN(id)) {
          this.selectedTypeCanalCode = null;
          this.form.get('type_canal_code')?.setValue(null, { emitEvent: true });
          return;
        }

        const found = (this.typeCanaux ?? []).find(tc => tc.id === id);
        this.selectedTypeCanalCode = found?.code ?? null;

        // ✅ alimenter le champ caché (recalc tranches dans buildCanalFG)
        this.form.get('type_canal_code')?.setValue(this.selectedTypeCanalCode, { emitEvent: true });
      });
  }

  private syncTypeCanalCodeFromCurrentSelection(): void {
    const typeCanalCtrl = this.form.get('type_canal');
    const id = Number(typeCanalCtrl?.value);

    if (!id || Number.isNaN(id)) {
      this.selectedTypeCanalCode = null;
      this.form.get('type_canal_code')?.setValue(null, { emitEvent: true });
      return;
    }

    const found = (this.typeCanaux ?? []).find(tc => tc.id === id);
    this.selectedTypeCanalCode = found?.code ?? null;

    this.form.get('type_canal_code')?.setValue(this.selectedTypeCanalCode, { emitEvent: true });
  }

  // ------------------------------------------------
  // ✅ Type station (ID) -> getItem -> code
  // ------------------------------------------------
  private listenTypeStationChanges(): void {
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
  }

  // ------------------------------------------------
  // DATA
  // ------------------------------------------------
  loadData(): void {
    const cat = this.data.cat;

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanal[]) => {
      this.typeCanaux = (listeCanaux ?? []).filter(tc => tc.categorie_produit === cat);
      this.syncTypeCanalCodeFromCurrentSelection();
    });

    this.caractereRadioService.getListItems().subscribe((listeCaractereRadios: CaractereRadio[]) => {
      this.caractereRadios = listeCaractereRadios ?? [];
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
    return true;
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
      ctrl.setValue(target.id, { emitEvent: true });
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // -----------------------------
  // Règles métier cat 3/4/5 (inchangé)
  // + ✅ reset classe_puissance_id quand on reset puissance_sortie
  // -----------------------------
  private applyConditionalVisibilityAndValidators(): void {
    const cat = this.data.cat;
    const code = this.getSelectedTypeStationCode();

    const zoneCtrl = this.form.get('zone_couverture');
    const bandeCtrl = this.form.get('type_bande_frequence');
    const duplexCtrl = this.form.get('mode_duplexage');
    const puissanceCtrl = this.form.get('puissance_sortie');

    // ✅ NEW : champ calculé
    const classePuissanceIdCtrl = this.form.get('classe_puissance_id');

    this.clearValidators(zoneCtrl);
    this.clearValidators(bandeCtrl);
    this.clearValidators(duplexCtrl);
    this.clearValidators(puissanceCtrl);

    // helper : quand on efface puissance_sortie => on efface aussi la classe
    const resetClassePuissanceId = () => {
      classePuissanceIdCtrl?.setValue(null, { emitEvent: false });
      classePuissanceIdCtrl?.updateValueAndValidity({ emitEvent: false });
    };

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
        // ✅ en edit mode, on conserve aussi la classe (cohérent avec "keep value")
      } else {
        if (cat !== 5) this.hideAndReset(zoneCtrl);
        this.hideAndReset(bandeCtrl);
        this.hideAndReset(duplexCtrl);
        this.hideAndReset(puissanceCtrl);
        resetClassePuissanceId(); // ✅ NEW
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
        resetClassePuissanceId(); // ✅ NEW
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
        resetClassePuissanceId(); // ✅ NEW
        return;
      }

      this.hideAndReset(zoneCtrl);
      this.hideAndReset(bandeCtrl);
      this.hideAndReset(duplexCtrl);
      this.hideAndReset(puissanceCtrl);
      resetClassePuissanceId(); // ✅ NEW
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
        resetClassePuissanceId(); // ✅ NEW
        return;
      }

      if (code === 'TS_P2P_GT30') {
        this.showZoneCouverture = true;
        this.showTypeBandeFrequence = true;

        this.require(zoneCtrl);
        this.require(bandeCtrl);

        this.hideAndReset(duplexCtrl);
        this.hideAndReset(puissanceCtrl);
        resetClassePuissanceId(); // ✅ NEW
        return;
      }

      this.hideAndReset(zoneCtrl);
      this.hideAndReset(bandeCtrl);
      this.hideAndReset(duplexCtrl);
      this.hideAndReset(puissanceCtrl);
      resetClassePuissanceId(); // ✅ NEW
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
        resetClassePuissanceId(); // ✅ NEW
        return;
      }

      this.hideAndReset(puissanceCtrl);
      resetClassePuissanceId(); // ✅ NEW
      return;
    }
  }

  // ✅ permet d'afficher une étoile sur les champs required
  isRequired(ctrlName: string): boolean {
    const ctrl: any = this.form?.get(ctrlName);
    if (!ctrl) return false;

    if (typeof ctrl.hasValidator === 'function') {
      return ctrl.hasValidator(Validators.required);
    }

    const res = ctrl.validator ? ctrl.validator({} as any) : null;
    return !!(res && res.required);
  }

}
