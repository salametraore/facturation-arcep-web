// src/app/facture/frequences/modals/station-frequences-dialog/station-frequences-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { FicheTechniqueStationRequest } from '../../../../shared/models/fiche-technique-frequence-create-request';

import { buildStationFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequenceList } from '../../../../shared/models/typeBandeFrequenceList';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';

import { ZoneCouverture } from '../../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../../shared/services/zone-couverture.service';
import {ClasseLargeurBandeService} from "../../../../shared/services/classe-largeur-bande.service";
import {ClasseDebitService} from "../../../../shared/services/classe-debit.service";
import {ClassePuissanceService} from "../../../../shared/services/classe-puissance.service";
import {bindStationClasses} from "../../forms/station-classes-binder";
import { Subject } from 'rxjs';




export interface StationDialogData {
  station?: FicheTechniqueStationRequest;
  cat: CategoryId;   // catégorie de la fiche
}

@Component({
  selector: 'app-station-frequences-dialog',
  templateUrl: './station-frequences-dialog.component.html'
})
export class StationFrequencesDialogComponent implements OnInit {

  form!: FormGroup;
  title = 'Ajouter une station';

  typeBandeFrequences: TypeBandeFrequenceList[] = [];
  typeStations: TypeStation[] = [];
  zoneCouvertures: ZoneCouverture[] = [];

  // config de la catégorie courante (surchargée au ngOnInit)
  cfg = CATEGORY_CONFIG[1 as CategoryId];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StationFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StationDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private zoneCouvertureService: ZoneCouvertureService,
    private classePuissance: ClassePuissanceService,
    private classeDebit: ClasseDebitService,
    private classeLargeurBande: ClasseLargeurBandeService,
  ) {}

  // alias pratique pour le template
  get stationCfg() {
    return this.cfg.stations;
  }

  ngOnInit(): void {
    this.title = this.data.station ? 'Modifier la station' : 'Ajouter une station';

    // utiliser la bonne config de catégorie
    this.cfg = CATEGORY_CONFIG[this.data.cat];

    this.loadData();

    console.log("this.data.station");
    console.log(this.data.station);

    // FormGroup construit dynamiquement selon la catégorie + modèle FicheTechniqueStationRequest
    this.form = buildStationFG(
      this.fb,
      this.data.station ?? {},
      this.data.cat
    );

    bindStationClasses(this.form, {
      classePuissance: this.classePuissance,
      classeDebit: this.classeDebit,
      classeLargeurBande: this.classeLargeurBande
    }, this.destroy$);

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
      this.typeStations = listeTypeStations.filter(ts => ts.categorie_produit === cat);
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
      this.typeBandeFrequences = listeTypeBandesFreq.filter(bf => bf.categorie_produit === cat);
    });

    // utile uniquement si stationCfg.zone_couverture est visible
    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = listeZones.filter(z => z.categorie_produit === 2);
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as FicheTechniqueStationRequest;

    console.log('STATION renvoyée par la modale :', value);
    this.dialogRef.close(value);
  }
}
