// src/app/facture/frequences/modals/station-frequences-dialog/station-frequences-dialog.component.ts

import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { FicheTechniqueStationRequest } from '../../../../shared/models/fiche-technique-frequence-create-request';

import { buildStationFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequence } from '../../../../shared/models/typeBandeFrequenceDetail';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';

import { ZoneCouverture } from '../../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../../shared/services/zone-couverture.service';

import { ClasseLargeurBandeService } from "../../../../shared/services/classe-largeur-bande.service";
import { ClasseDebitService } from "../../../../shared/services/classe-debit.service";
import { ClassePuissanceService } from "../../../../shared/services/classe-puissance.service";
import { bindStationClasses } from "../../forms/station-classes-binder";
import { CaractereRadio } from "../../../../shared/models/caractere-radio.model";
import { CaractereRadioService } from "../../../../shared/services/caractere-radio.service";

export interface StationDialogData {
  station?: FicheTechniqueStationRequest;
  cat: CategoryId;
}

@Component({
  selector: 'app-station-frequences-dialog',
  templateUrl: './station-frequences-dialog.component.html'
})
export class StationFrequencesDialogComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  title = 'Ajouter une station';

  typeBandeFrequences: TypeBandeFrequence[] = [];
  typeStations: TypeStation[] = [];
  typeStationSeelectione: TypeStation;
  zoneCouvertures: ZoneCouverture[] = [];

  caractereRadios: CaractereRadio[] = [];
  caractereRadio!: CaractereRadio;

  cfg = CATEGORY_CONFIG[1 as CategoryId];

  private destroy$ = new Subject<void>();

  // ✅ flags d’affichage conditionnel (règles cat 1 / cat 6)
  showPuissance = true;
  showDebitKbps = true;
  showLargeurBandeMhz = true;

  // ✅ cache du code résolu via getItem(id)
  private selectedTypeStationCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StationFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StationDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private zoneCouvertureService: ZoneCouvertureService,
    private classePuissance: ClassePuissanceService,
    private classeDebit: ClasseDebitService,
    private caractereRadioService: CaractereRadioService,
    private classeLargeurBande: ClasseLargeurBandeService,
  ) {}

  get stationCfg() {
    return this.cfg.stations;
  }

  // ✅ NEW : permet d'afficher une étoile sur les champs required (même si required est ajouté/retiré dynamiquement)
  isRequired(ctrlName: string): boolean {
    const ctrl: any = this.form?.get(ctrlName);
    if (!ctrl) return false;

    // Angular >= 14
    if (typeof ctrl.hasValidator === 'function') {
      return ctrl.hasValidator(Validators.required);
    }

    // fallback
    const res = ctrl.validator ? ctrl.validator({} as any) : null;
    return !!(res && res.required);
  }

  ngOnInit(): void {
    this.title = this.data.station ? 'Modifier la station' : 'Ajouter une station';

    this.cfg = CATEGORY_CONFIG[this.data.cat];

    this.loadData();

    this.form = buildStationFG(this.fb, this.data.station ?? {}, this.data.cat);

    // binder existant (classe_puissance / classe_debit / classe_largeur_bande)
    bindStationClasses(this.form, {
      classePuissance: this.classePuissance,
      classeDebit: this.classeDebit,
      classeLargeurBande: this.classeLargeurBande
    }, this.destroy$);

    // ✅ écoute changement type_station => va chercher le code via API => applique règles
    const typeCtrl = this.form.get('type_station');
    typeCtrl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((id: number | null) => this.resolveTypeStationCodeAndApply(id));

    // ✅ 1ère application (édition) : résoudre le code si déjà un id
    const initialId = typeCtrl?.value as number | null;
    this.resolveTypeStationCodeAndApply(initialId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadData(): void {
    const cat = this.data.cat;

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = (listeTypeStations ?? []).filter(ts => ts.categorie_produit === cat);
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequence[]) => {
      this.typeBandeFrequences = (listeTypeBandesFreq ?? []).filter(bf => bf.categorie_produit === cat);
    });

    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = (listeZones ?? []).filter(z => z.categorie_produit === 2);
    });

    this.caractereRadioService.getListItems().subscribe((listeCaractereRadios: CaractereRadio[]) => {
      this.caractereRadios = listeCaractereRadios ?? [];
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as FicheTechniqueStationRequest;
    this.dialogRef.close(value);
  }

  // ---------- visibilité côté template ----------
  isPuissanceVisible(): boolean {
    const baseVisible = this.stationCfg?.puissance?.visible !== false;
    return baseVisible && this.showPuissance;
  }

  isDebitVisible(): boolean {
    const baseVisible = this.stationCfg?.debit_kbps?.visible !== false;
    return baseVisible && this.showDebitKbps;
  }

  isLargeurBandeMhzVisible(): boolean {
    const baseVisible = this.stationCfg?.largeur_bande_mhz?.visible !== false;
    return baseVisible && this.showLargeurBandeMhz;
  }

  // ---------- résolution code via API ----------
  private getSelectedTypeStationCode(): string | null {
    return this.selectedTypeStationCode;
  }

  private resolveTypeStationCodeAndApply(id: number | null): void {
    if (!id) {
      this.selectedTypeStationCode = null;
      this.applyConditionalVisibilityAndValidators();
      return;
    }

    this.typeStationService.getItem(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ts: TypeStation) => {
          this.selectedTypeStationCode = ts?.code ?? null;
          this.applyConditionalVisibilityAndValidators();
        },
        error: (e) => {
          console.error('Erreur getItem(type_station):', e);
          this.selectedTypeStationCode = null;
          this.applyConditionalVisibilityAndValidators();
        }
      });
  }

  // ---------- règles cat 1 / cat 6 ----------
  private applyConditionalVisibilityAndValidators(): void {
    const cat = this.data.cat;
    const code = this.getSelectedTypeStationCode();

    const puissanceCtrl = this.form.get('puissance');
    const debitCtrl = this.form.get('debit_kbps');
    const lbCtrl = this.form.get('largeur_bande_mhz');

    const clearAndNull = (ctrl: any) => {
      if (!ctrl) return;
      ctrl.clearValidators();
      ctrl.setValue(null, { emitEvent: false });
      ctrl.updateValueAndValidity({ emitEvent: false });
    };

    const require = (ctrl: any) => {
      if (!ctrl) return;
      ctrl.setValidators([Validators.required]);
      ctrl.updateValueAndValidity({ emitEvent: false });
    };

    // =========================
    // CAT = 1 : PUISSANCE
    // affichée + required si code in ('TS_PMR_MOBILE','TS_PMR_PORTABLE')
    // =========================
    if (cat === 1) {
      this.showPuissance = false;

      const mustShow = code === 'TS_PMR_MOBILE' || code === 'TS_PMR_PORTABLE';

      if (mustShow) {
        this.showPuissance = true;
        require(puissanceCtrl);
      } else {
        clearAndNull(puissanceCtrl);
      }

      return;
    }

    // =========================
    // CAT = 6 : DEBIT + LARGEUR_BANDE_MHZ
    // debit_kbps => TS_VSAT
    // largeur_bande_mhz => TS_TERR_PUB
    // =========================
    if (cat === 6) {
      this.showDebitKbps = false;
      this.showLargeurBandeMhz = false;

      const mustShowDebit = code === 'TS_VSAT';
      const mustShowLB = code === 'TS_TERR_PUB';

      if (mustShowDebit) {
        this.showDebitKbps = true;
        require(debitCtrl);
      } else {
        clearAndNull(debitCtrl);
      }

      if (mustShowLB) {
        this.showLargeurBandeMhz = true;
        require(lbCtrl);
      } else {
        clearAndNull(lbCtrl);
      }

      return;
    }

    // autres catégories : on laisse la config standard décider
    this.showPuissance = true;
    this.showDebitKbps = true;
    this.showLargeurBandeMhz = true;
  }

  getLibelleCaractereRadio(id?: number | null): string {
    if (!id || !this.caractereRadios || this.caractereRadios.length === 0) {
      return '';
    }
    const found = this.caractereRadios.find(cr => cr.id === id);
    return found?.libelle ?? '';
  }

}
