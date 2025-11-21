// src/app/facture/frequences/modals/station-frequences-dialog/station-frequences-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { StationEquipementRequest } from '../../../../shared/models/fiche-technique-frequence';

import { buildStationEquipementFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequenceList } from '../../../../shared/models/typeBandeFrequenceList';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';

export interface StationDialogData {
  station?: StationEquipementRequest;
  cat: CategoryId;   // catégorie de la fiche
}

interface UniteOption {
  id: string;
  libelle: string;
}

@Component({
  selector: 'app-station-frequences-dialog',
  templateUrl: './station-frequences-dialog.component.html'
})
export class StationFrequencesDialogComponent implements OnInit {

  form: FormGroup;
  title = 'Ajouter une station';

  typeBandeFrequences: TypeBandeFrequenceList[] = [];
  typeStations: TypeStation[] = [];

  // Options d’unité pour largeur_bande (kHz / MHz, etc.)
  largeurBandeUnites: UniteOption[] = [
    { id: 'KHZ', libelle: 'kHz' },
    { id: 'MHZ', libelle: 'MHz' }
  ];

  // config de la catégorie courante (surchargée au ngOnInit)
  cfg = CATEGORY_CONFIG[1 as CategoryId];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StationFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StationDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
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

    // FormGroup construit dynamiquement selon la catégorie + modèle StationEquipementRequest
    this.form = buildStationEquipementFG(
      this.fb,
      this.data.station ?? {},
      this.data.cat
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadData(): void {
    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = listeTypeStations;
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
      this.typeBandeFrequences = listeTypeBandesFreq;
    });
  }

  onSave(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as StationEquipementRequest;

    console.log('STATION renvoyée par la modale :', value);
    this.dialogRef.close(value);   // renvoi au parent (FrequencesCrudComponent)
  }

}
