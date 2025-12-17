// src/app/facture/frequences/modals/canal-frequences-dialog/canal-frequences-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
import {ClasseLargeurBandeService} from "../../../../shared/services/classe-largeur-bande.service";
import {ClasseDebitService} from "../../../../shared/services/classe-debit.service";
import {ClassePuissanceService} from "../../../../shared/services/classe-puissance.service";
import {bindStationClasses} from "../../forms/station-classes-binder";
import { Subject } from 'rxjs';
import {bindCanalClasses} from "../../forms/canal-classes-binder";




export interface CanalDialogData {
  canal?: FicheTechniqueCanalRequest;
  cat: CategoryId;   // catégorie courante (1..7)
}

@Component({
  selector: 'app-canal-frequences-dialog',
  templateUrl: './canal-frequences-dialog.component.html'
})
export class CanalFrequencesDialogComponent implements OnInit {

  form!: FormGroup;
  title = 'Ajouter un canal';

  // config de la catégorie courante (surchargée dans ngOnInit)
  cfg = CATEGORY_CONFIG[1 as CategoryId];
  private destroy$ = new Subject<void>();

  typeBandeFrequences: TypeBandeFrequenceList[] = [];
  typeCanaux: TypeCanalList[] = [];
  typeStations: TypeStation[] = [];
  zoneCouvertures: ZoneCouverture[] = [];



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
    this.form = buildCanalFG(
      this.fb,
      this.data.canal ?? {},
      this.data.cat
    );

    bindCanalClasses(this.form, this.classeLargeurBande, this.destroy$);

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadData(): void {
    const cat = this.data.cat;

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanalList[]) => {
      this.typeCanaux = listeCanaux;
      //this.typeCanaux = listeCanaux.filter(ts => ts.categorie_produit === cat);
    });

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = listeTypeStations.filter(ts => ts.categorie_produit === cat);
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
      this.typeBandeFrequences = listeTypeBandesFreq.filter(bf => bf.categorie_produit === cat);
    });

    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = listeZones.filter(z => z.categorie_produit === 2);
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

    // ⚠️ nouveau type
    const value = this.form.getRawValue() as FicheTechniqueCanalRequest;

    console.log('CANAL renvoyé par la modale :', value);
    this.dialogRef.close(value);
  }
}
