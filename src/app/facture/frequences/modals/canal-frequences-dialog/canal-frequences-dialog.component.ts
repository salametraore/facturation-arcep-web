// src/app/facture/frequences/modals/canal-frequences-dialog/canal-frequences-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoryId } from '../../../../shared/models/frequences-category.types';
import { StationCanalRequest } from '../../../../shared/models/fiche-technique-frequence';

import { buildStationCanalFG } from '../../forms/frequences.form';
import { CATEGORY_CONFIG } from '../../config/frequences-category.config';

import { TypeCanalList } from '../../../../shared/models/typeCanalList';
import { TypeStation } from '../../../../shared/models/type-station';
import { TypeBandeFrequenceList } from '../../../../shared/models/typeBandeFrequenceList';
import { TypeBandesFrequenceService } from '../../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../../shared/services/type-station.service';
import { TypeCanauxService } from '../../../../shared/services/type-canaux.service';
import { ZoneCouverture } from '../../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../../shared/services/zone-couverture.service';

export interface CanalDialogData {
  canal?: StationCanalRequest;
  cat: CategoryId;   // catégorie courante (1..7)
}

interface UniteOption {
  id: string;
  libelle: string;
}

@Component({
  selector: 'app-canal-frequences-dialog',
  templateUrl: './canal-frequences-dialog.component.html'
})
export class CanalFrequencesDialogComponent implements OnInit {

  form: FormGroup;
  title = 'Ajouter un canal';

  // config de la catégorie courante (surchargée dans ngOnInit)
  cfg = CATEGORY_CONFIG[1 as CategoryId];

  typeBandeFrequences: TypeBandeFrequenceList[] = [];
  typeCanaux: TypeCanalList[] = [];
  typeStations: TypeStation[] = [];
  zoneCouvertures: ZoneCouverture[] = [];

  // Options pour largeur_bande_unite (kHz/MHz, etc.)
  largeurBandeUnites: UniteOption[] = [
    { id: 'KHZ', libelle: 'kHz' },
    { id: 'MHZ', libelle: 'MHz' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CanalFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CanalDialogData,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private zoneCouvertureService: ZoneCouvertureService,
  ) {}

  // alias pratique pour le template
  get canalCfg() {
    return this.cfg.canaux;
  }

  ngOnInit(): void {
    this.title = this.data.canal ? 'Modifier le canal' : 'Ajouter un canal';

    // appliquer la bonne config de catégorie
    this.cfg = CATEGORY_CONFIG[this.data.cat];

    this.loadData();

    // FormGroup construit dynamiquement selon la catégorie + valeurs existantes
    this.form = buildStationCanalFG(
      this.fb,
      this.data.canal ?? {},
      this.data.cat
    );
  }

  loadData(): void {

    const cat = this.data.cat;

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanalList[]) => {
      this.typeCanaux = listeCanaux.filter(st => st.id < 3);
    });


    this.typeStationService.getListItems().subscribe(
      (listeTypeStations: TypeStation[]) => {
        this.typeStations = listeTypeStations.filter(
          ts => ts.categorie_produit === cat
        );
      }
    );

    this.typeBandesFrequenceService.getListItems().subscribe(
      (listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
        this.typeBandeFrequences = listeTypeBandesFreq.filter(
          bf => bf.categorie_produit === cat
        );
      }
    );

    this.zoneCouvertureService.getListItems().subscribe(
      (listeZones: ZoneCouverture[]) => {
        this.zoneCouvertures = listeZones.filter(
          z => z.categorie_produit === 2
        );
      }
    );

  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as StationCanalRequest;

    console.log('CANAL renvoyé par la modale :', value);
    this.dialogRef.close(value);   // renvoi au parent (FrequencesCrudComponent)
  }

}
