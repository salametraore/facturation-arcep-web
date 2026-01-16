// src/app/features/parametrage/classe-largeur-bande/classe-largeur-bande-crud/classe-largeur-bande-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { ClasseLargeurBande, ClasseLargeurBandeRequest } from '../../../shared/models/classe-largeur-bande.model';
import { CategorieProduit } from '../../../shared/models/categorie-produit';

import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'classe-largeur-bande-crud',
  templateUrl: './classe-largeur-bande-crud.component.html'
})
export class ClasseLargeurBandeCrudComponent implements OnInit {

  classeLargeurBande?: ClasseLargeurBande;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' classe largeur de bande';

  public operations = operations;
  public bouton_names = bouton_names;

  public data_operation: string = '';
  errorMessage: any;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private classeLargeurBandeService: ClasseLargeurBandeService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<ClasseLargeurBandeCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // ✅ aligné avec la liste : data = { classeLargeurBande, operation }
    this.classeLargeurBande = data?.classeLargeurBande;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.classeLargeurBande && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.classeLargeurBande && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.classeLargeurBande && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      this.form.disable(); // ✅ détails => lecture seule
    }

    this.title = this.title + ' - ' + this.window_name;
  }

  loadData(): void {
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
    });
  }

  initForm_update(): void {
    this.form = this.formBuilder.group({
      id: [this.classeLargeurBande?.id],

      categorie_produit: [this.classeLargeurBande?.categorie_produit ?? null],
      code: [this.classeLargeurBande?.code ?? '', Validators.required],
      libelle: [this.classeLargeurBande?.libelle ?? '', Validators.required],

      lb_min_mhz: [this.classeLargeurBande?.lb_min_mhz ?? null],
      lb_max_mhz: [this.classeLargeurBande?.lb_max_mhz ?? null],

      actif: [this.classeLargeurBande?.actif ?? true]
    });
  }

  initForm_create(): void {
    this.form = this.formBuilder.group({
      id: [''],

      categorie_produit: [null],
      code: ['', Validators.required],
      libelle: ['', Validators.required],

      lb_min_mhz: [null],
      lb_max_mhz: [null],

      actif: [true]
    });
  }

  private buildPayload(): ClasseLargeurBandeRequest {
    const v = this.form.value;

    // ✅ attention: ton API peut renvoyer decimal en string,
    // ici on envoie tel quel (Angular input type="number" => number)
    const payload: ClasseLargeurBandeRequest = {
      code: v.code,
      libelle: v.libelle,
      categorie_produit: v.categorie_produit ?? null,
      lb_min_mhz: v.lb_min_mhz ?? null,
      lb_max_mhz: v.lb_max_mhz ?? null,
      actif: v.actif === false ? false : true
    };

    return payload;
  }

  crud(): void {
    const payload = this.buildPayload();
    const id = this.form.value?.id;

    if (this.mode === operations.update) {
      this.classeLargeurBandeService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          const msg = error?.error?.message ?? error;
          this.dialogService.alert({ message: msg });
          this.errorMessage = msg;
        }
      );
    } else if (this.mode === operations.create) {
      this.classeLargeurBandeService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Enregistré avec succès');
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
