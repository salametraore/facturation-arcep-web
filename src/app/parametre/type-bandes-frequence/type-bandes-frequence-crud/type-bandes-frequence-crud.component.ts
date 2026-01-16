import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { TypeBandeFrequence, TypeBandeFrequenceRequest } from '../../../shared/models/typeBandeFrequenceDetail';
import { TypeBandesFrequenceService } from '../../../shared/services/type-bandes-frequence.service';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'type-bandes-frequence-crud',
  templateUrl: './type-bandes-frequence-crud.component.html'
})
export class TypeBandesFrequenceCrudComponent implements OnInit {

  typeBandeFrequence?: TypeBandeFrequence;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' type bande de fréquence';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<TypeBandesFrequenceCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    this.typeBandeFrequence = data?.typeBandeFrequence;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.typeBandeFrequence && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.typeBandeFrequence && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.typeBandeFrequence && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      // (optionnel) : verrouiller complètement le form
      // this.form.disable();
    }

    this.title = `${this.title} - ${this.window_name}`;
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((categorieProduits: CategorieProduit[]) => {
      this.categorieProduits = categorieProduits ?? [];
    });
  }

  private initForm_update(): void {
    this.form = this.fb.group({
      id: [this.typeBandeFrequence?.id],
      code: [this.typeBandeFrequence?.code, Validators.required],
      libelle: [this.typeBandeFrequence?.libelle, Validators.required],
      categorie_produit: [this.typeBandeFrequence?.categorie_produit, Validators.required]
    });
  }

  private initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      categorie_produit: ['', Validators.required]
    });
  }

  crud(): void {
    const formValue = this.form.value;

    const payload: TypeBandeFrequenceRequest = {
      code: formValue['code'],
      libelle: formValue['libelle'],
      categorie_produit: formValue['categorie_produit']
    };

    const id = formValue['id'];

    if (this.mode === operations.update) {
      this.typeBandesFrequenceService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Type bande de fréquence enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = error?.error?.message ?? msg;
        }
      );
    } else if (this.mode === operations.create) {
      this.typeBandesFrequenceService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Type bande de fréquence enregistré avec succès');
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
