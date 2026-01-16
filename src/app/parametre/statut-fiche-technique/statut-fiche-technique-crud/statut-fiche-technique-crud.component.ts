import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import { bouton_names, operations } from '../../../constantes';

import {
  StatutFicheTechnique,
  StatutFicheTechniqueRequest
} from '../../../shared/models/statut-fiche-technique';

import { StatutFicheTechniqueService } from '../../../shared/services/statut-fiche-technique.service';

@Component({
  selector: 'statut-fiche-technique-crud',
  templateUrl: './statut-fiche-technique-crud.component.html'
})
export class StatutFicheTechniqueCrudComponent implements OnInit {
  statut?: StatutFicheTechnique;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' statut fiche technique';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private statutService: StatutFicheTechniqueService,
    public dialogRef: MatDialogRef<StatutFicheTechniqueCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // ✅ aligné avec la liste : dialogConfig.data = { statutFicheTechnique: element, operation }
    this.statut = data.statutFicheTechnique;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    if (this.statut && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.statut && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.statut && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }

    this.title = this.title + ' - ' + this.window_name;

    // ✅ en détails, on peut verrouiller le form complètement
    if (this.data_operation === this.operations.details) {
      this.form.disable({ emitEvent: false });
    }
  }

  initForm_update(): void {
    this.form = this.formBuilder.group({
      id: [this.statut?.id],
      code: [this.statut?.code, Validators.required],
      libelle: [this.statut?.libelle, Validators.required]
    });
  }

  initForm_create(): void {
    this.form = this.formBuilder.group({
      id: [''],
      code: ['', Validators.required],
      libelle: ['', Validators.required]
    });
  }

  crud(): void {
    const formValue = this.form.getRawValue();

    const payload: StatutFicheTechniqueRequest = {
      code: formValue['code'],
      libelle: formValue['libelle']
    };

    if (this.mode === operations.update) {
      const id = Number(formValue['id']);
      this.statutService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Statut enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = error?.error?.message ?? msg;
        }
      );
    } else if (this.mode === operations.create) {
      this.statutService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Statut enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = error?.error?.message ?? msg;
        }
      );
    }
  }
}
