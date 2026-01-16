// src/app/features/parametrage/classe-debit/classe-debit-crud/classe-debit-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { ClasseDebit, ClasseDebitRequest } from '../../../shared/models/classe-debit.model';
import { CategorieProduit } from '../../../shared/models/categorie-produit';

import { ClasseDebitService } from '../../../shared/services/classe-debit.service';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'classe-debit-crud',
  templateUrl: './classe-debit-crud.component.html'
})
export class ClasseDebitCrudComponent implements OnInit {

  classeDebit?: ClasseDebit;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' classe débit';

  public operations = operations;
  public bouton_names = bouton_names;

  public data_operation: string = '';
  errorMessage: any;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private classeDebitService: ClasseDebitService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<ClasseDebitCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // ✅ aligné avec la liste : data = { classeDebit, operation }
    this.classeDebit = data?.classeDebit;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.classeDebit && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.classeDebit && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.classeDebit && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      // en détails on ne soumet pas, mais on garde le même form
    }

    this.title = this.title + ' - ' + this.window_name;
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
    });
  }

  initForm_update(): void {
    this.form = this.fb.group({
      id: [this.classeDebit?.id],
      code: [this.classeDebit?.code, Validators.required],
      libelle: [this.classeDebit?.libelle, Validators.required],
      debit_min_kbps: [this.classeDebit?.debit_min_kbps ?? null],
      debit_max_kbps: [this.classeDebit?.debit_max_kbps ?? null],
      categorie_produit: [this.classeDebit?.categorie_produit ?? null]
    });
  }

  initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      debit_min_kbps: [null],
      debit_max_kbps: [null],
      categorie_produit: [null]
    });
  }

  crud(): void {
    if (!this.form) return;

    const v = this.form.value;

    // ✅ payload API (Request)
    const payload: ClasseDebitRequest = {
      code: v['code'],
      libelle: v['libelle'],
      debit_min_kbps: v['debit_min_kbps'],
      debit_max_kbps: v['debit_max_kbps'],
      categorie_produit: v['categorie_produit']
      // created_at/updated_at/created_by/updated_by: gérés serveur si besoin
    };

    const id = v['id'];

    if (this.mode === this.operations.update) {
      this.classeDebitService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Classe débit enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = msg;
        }
      );
    } else if (this.mode === this.operations.create) {
      this.classeDebitService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Classe débit enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = msg;
        }
      );
    }
  }
}
