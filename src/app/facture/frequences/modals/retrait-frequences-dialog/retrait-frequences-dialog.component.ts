import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { date_converte } from '../../../../constantes';
import { DialogService } from '../../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../../shared/services/msg-message-service.service';
import { FichesTechniquesFrequenceService } from '../../../../shared/services/fiches-techniques-frequences';

import {
  FicheTechniqueFrequenceDetail,
  ModeRetraitFrequence,
  DesactiverElementsFicheFrequenceRequest, FicheTechniqueStationDetail, FicheTechniqueCanalDetail
} from '../../../../shared/models/fiche-technique-frequence-create-request';


import {
  FicheTechniqueStation,
  FicheTechniqueCanal
} from '../../../../shared/models/fiche-technique-frequence';
import {TypeCanal} from "../../../../shared/models/typeCanal";
import {TypeStation} from "../../../../shared/models/type-station";
import {TypeStationService} from "../../../../shared/services/type-station.service";
import {TypeCanauxService} from "../../../../shared/services/type-canaux.service";
import {RetraitAutorisationRequest} from "../../../../shared/models/ficheTechniques";

export interface RetraitFrequencesDialogData {
  ficheTechniqueId: number;
}

function selectionPartielleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const mode = control.get('mode_retrait')?.value as ModeRetraitFrequence;
    const stationIds: number[] = control.get('station_ids')?.value ?? [];
    const canalIds: number[] = control.get('canal_ids')?.value ?? [];

    if (mode !== 'PARTIEL') {
      return null;
    }

    if ((stationIds?.length ?? 0) > 0 || (canalIds?.length ?? 0) > 0) {
      return null;
    }

    return { partialSelectionRequired: true };
  };
}

@Component({
  selector: 'retrait-frequences-dialog',
  templateUrl: './retrait-frequences-dialog.component.html',
  styleUrls: ['./retrait-frequences-dialog.component.scss']
})
export class RetraitFrequencesDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  submitting = false;
  errorMessage = '';

  detail!: FicheTechniqueFrequenceDetail;

  private destroy$ = new Subject<void>();
  typeStations : TypeStation[]=[];
  typeCanaux : TypeCanal[]=[];


  constructor(
    private fb: FormBuilder,
    private frequencesService: FichesTechniquesFrequenceService,
    private dialogService: DialogService,
    private typeStationService :TypeStationService,
    private typeCanauxService :TypeCanauxService,
    private msgService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<RetraitFrequencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RetraitFrequencesDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDetail();
  }

  private initForm(): void {
    this.form = this.fb.group(
      {
        mode_retrait: ['GLOBAL', Validators.required],

        client: [{ value: '', disabled: true }],
        categorie_produit: [{ value: '', disabled: true }],
        objet: [{ value: '', disabled: true }],
        statut: [{ value: '', disabled: true }],

        date_retrait: ['', Validators.required],
        motif_retrait: ['', [Validators.required, Validators.maxLength(500)]],

        station_ids: [[]],
        canal_ids: [[]]
      },
      { validators: selectionPartielleValidator() }
    );
  }

  get modeRetrait(): ModeRetraitFrequence {
    return this.form.get('mode_retrait')?.value as ModeRetraitFrequence;
  }

  get stationsActives(): FicheTechniqueStation[] {
    return (this.detail?.stations ?? []).filter(s => s.actif !== false);
  }

  get canauxActifs(): FicheTechniqueCanal[] {
    return (this.detail?.canaux ?? []).filter(c => c.actif !== false);
  }

  get submitLabel(): string {
    return this.modeRetrait === 'GLOBAL'
      ? 'Valider le retrait global'
      : 'Désactiver les éléments';
  }

  private loadDetail(): void {
    this.loading = true;
    this.errorMessage = '';

    this.frequencesService.getDetailFicheTechniqueFrequence(this.data.ficheTechniqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.detail = detail;

          this.form.patchValue({
            client: detail.client_nom ?? '',
            categorie_produit: detail.categorie_produit_libelle ?? '',
            objet: detail.objet ?? '',
            statut: detail.statut?.libelle ?? ''
          });

          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = "Impossible de charger le détail de la fiche fréquence.";
          this.loading = false;
        }
      });

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanal[]) => {
      this.typeCanaux = listeCanaux;
    });

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = listeTypeStations;
    });

  }


  getLibelleTypeCanal(id?: number | null): string {
    if (!id || !this.typeCanaux || this.typeCanaux.length === 0) {
      return '';
    }
    const found = this.typeCanaux.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  getLibelleTypeStation(id?: number | null): string {
    if (!id || !this.typeStations || this.typeStations.length === 0) {
      return '';
    }
    const found = this.typeStations.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  stationLabel(station: FicheTechniqueStationDetail, index: number): string {
    if (station.designation) {
      return station.designation;
    }

    const type = this.getLibelleTypeStation(station.type_station) ;
    const localite = station.localite ? ` — ${station.localite}` : '';
    return `Station ${index + 1} — ${type}${localite}`;
  }

  canalLabel(canal: FicheTechniqueCanalDetail, index: number): string {
    if (canal.designation) {
      return canal.designation;
    }

    const typeCanal = this.getLibelleTypeCanal(canal.type_canal) ;
    return `Canal ${index + 1} — ${typeCanal}`;
  }

  crud(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.hasError('partialSelectionRequired')) {
        this.dialogService.alert({
          message: 'Veuillez sélectionner au moins une station ou un canal à désactiver.'
        });
      }
      return;
    }

    if (this.modeRetrait === 'GLOBAL') {
      this.retraitGlobal();
      return;
    }

    this.desactiverElements();
  }

  private retraitGlobal(): void {
    const raw = this.form.getRawValue();

    const payload: RetraitAutorisationRequest = {
      fiche_technique: this.data.ficheTechniqueId,
      date_retrait: date_converte(raw.date_retrait),
      motif_retrait: raw.motif_retrait
    };

    this.submitting = true;

    this.frequencesService.retraitGlobal(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.msgService.success(res?.message || 'Retrait global effectué avec succès');
          this.dialogRef.close('Yes');
        },
        error: (error) => {
          console.error(error);
          this.dialogService.alert({
            message: error?.error?.message || 'Erreur lors du retrait global.'
          });
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

  private desactiverElements(): void {
    const raw = this.form.getRawValue();

    const payload: DesactiverElementsFicheFrequenceRequest = {
      fiche_technique_id: this.data.ficheTechniqueId,
      station_ids: raw.station_ids ?? [],
      canal_ids: raw.canal_ids ?? [],
      date_retrait: date_converte(raw.date_retrait),
      motif_retrait: raw.motif_retrait
    };

    this.submitting = true;

    this.frequencesService.desactiverStationsCanaux(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.msgService.success(res?.message || 'Désactivation effectuée avec succès');
          this.dialogRef.close('Yes');
        },
        error: (error) => {
          console.error(error);
          this.dialogService.alert({
            message: error?.error?.message || 'Erreur lors de la désactivation.'
          });
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
