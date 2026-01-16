import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { TypeStation, TypeStationRequest } from '../../../shared/models/type-station';
import { TypeStationService } from '../../../shared/services/type-station.service';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'type-stations-crud',
  templateUrl: './type-stations-crud.component.html'
})
export class TypeStationsCrudComponent implements OnInit {

  typeStation?: TypeStation;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' type station';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;
  categorieProduits: CategorieProduit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private typeStationService: TypeStationService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<TypeStationsCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    this.typeStation = data?.typeStation;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
    });
  }

  init(): void {
    if (this.typeStation && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.typeStation && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.typeStation && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }

    this.title = this.title + ' - ' + this.window_name;

    // ✅ en mode détails on verrouille tout le formulaire
    if (this.data_operation === this.operations.details) {
      this.form.disable({ emitEvent: false });
    }
  }

  initForm_update(): void {
    this.form = this.formBuilder.group({
      id: [this.typeStation?.id],
      code: [this.typeStation?.code, Validators.required],
      libelle: [this.typeStation?.libelle, Validators.required],
      categorie_produit: [this.typeStation?.categorie_produit, Validators.required]
    });
  }

  initForm_create(): void {
    this.form = this.formBuilder.group({
      id: [''],
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      categorie_produit: ['', Validators.required]
    });
  }

  crud(): void {
    const formValue = this.form.getRawValue();

    const payload: TypeStationRequest = {
      code: formValue['code'],
      libelle: formValue['libelle'],
      categorie_produit: formValue['categorie_produit']
    };

    if (this.mode === operations.update) {
      const id = Number(formValue['id']);
      this.typeStationService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Type station enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = error?.error?.message ?? msg;
        }
      );
    } else if (this.mode === operations.create) {
      this.typeStationService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Type station enregistré avec succès');
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
