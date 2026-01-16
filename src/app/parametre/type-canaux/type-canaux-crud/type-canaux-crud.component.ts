import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { TypeCanal, TypeCanalRequest } from '../../../shared/models/typeCanal';
import { TypeCanauxService } from '../../../shared/services/type-canaux.service';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'type-canaux-crud',
  templateUrl: './type-canaux-crud.component.html'
})
export class TypeCanauxCrudComponent implements OnInit {

  typeCanal?: TypeCanal;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' type canal';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;
  categorieProduits: CategorieProduit[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private typeCanauxService: TypeCanauxService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<TypeCanauxCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // ✅ aligné avec la page liste : data = { typeCanal, operation }
    this.typeCanal = data?.typeCanal;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.typeCanal && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.typeCanal && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.typeCanal && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      this.form.disable(); // ✅ read-only complet
    }

    this.title = `${this.title} - ${this.window_name}`;
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
    });
  }

  initForm_update(): void {
    this.form = this.fb.group({
      id: [this.typeCanal?.id],
      code: [this.typeCanal?.code, Validators.required],
      libelle: [this.typeCanal?.libelle, Validators.required],
      categorie_produit: [this.typeCanal?.categorie_produit, Validators.required],
    });
  }

  initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      categorie_produit: ['', Validators.required],
    });
  }

  crud(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const payload: TypeCanalRequest = {
      code: formValue['code'],
      libelle: formValue['libelle'],
      categorie_produit: formValue['categorie_produit'],
    };

    const id = formValue['id'];

    if (this.mode === operations.update) {
      this.typeCanauxService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Type canal enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    } else if (this.mode === operations.create) {
      this.typeCanauxService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Type canal enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    }
  }
}
