// src/app/features/parametrage/classe-puissance/classe-puissance-crud/classe-puissance-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

import { ClassePuissance, ClassePuissanceRequest } from '../../../shared/models/classe-puissance.model';
import { ClassePuissanceService } from '../../../shared/services/classe-puissance.service';

@Component({
  selector: 'classe-puissance-crud',
  templateUrl: './classe-puissance-crud.component.html'
})
export class ClassePuissanceCrudComponent implements OnInit {

  classePuissance?: ClassePuissance;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' classe puissance';

  public operations = operations;
  public bouton_names = bouton_names;

  public data_operation: string = '';
  errorMessage: any;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private classePuissanceService: ClassePuissanceService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<ClassePuissanceCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    this.classePuissance = data?.classePuissance;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.classePuissance && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.classePuissance && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.classePuissance && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      // (en details on garde le même form, mais readonly/disabled dans le HTML)
    }

    this.title = this.title + ' - ' + this.window_name;
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
    });
  }

  private initForm_update(): void {
    this.form = this.fb.group({
      id: [this.classePuissance?.id],

      code: [this.classePuissance?.code, Validators.required],
      libelle: [this.classePuissance?.libelle, Validators.required],

      // p_min_w / p_max_w : tes modèles peuvent être number ou string (service gère via toNumber)
      p_min_w: [this.classePuissance?.p_min_w ?? null],
      p_max_w: [this.classePuissance?.p_max_w ?? null],

      categorie_produit: [this.classePuissance?.categorie_produit ?? null]
    });
  }

  private initForm_create(): void {
    this.form = this.fb.group({
      id: [''],

      code: ['', Validators.required],
      libelle: ['', Validators.required],

      p_min_w: [null],
      p_max_w: [null],

      categorie_produit: [null]
    });
  }

  crud(): void {
    this.errorMessage = null;

    const v = this.form.value;

    const payload: ClassePuissanceRequest = {
      code: v.code,
      libelle: v.libelle,
      p_min_w: v.p_min_w,
      p_max_w: v.p_max_w,
      categorie_produit: v.categorie_produit
    };

    const id = v.id as number;

    if (this.mode === operations.update) {
      this.classePuissanceService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Classe puissance enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    } else if (this.mode === operations.create) {
      this.classePuissanceService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Classe puissance enregistrée avec succès');
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
