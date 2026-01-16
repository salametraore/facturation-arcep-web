// src/app/features/parametrage/tarif-redevance-gestion/tarif-redevance-gestion-crud/tarif-redevance-gestion-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import {
  TarifRedevanceGestion,
  TarifRedevanceGestionRequest
} from '../../../shared/models/tarif-redevance-gestion.model';

import { TarifRedevanceGestionService } from '../../../shared/services/tarif-redevance-gestion.service';

import { Produit } from '../../../shared/models/produit';
import { ProduitService } from '../../../shared/services/produits.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'tarif-redevance-gestion-crud',
  templateUrl: './tarif-redevance-gestion-crud.component.html'
})
export class TarifRedevanceGestionCrudComponent implements OnInit {

  item?: TarifRedevanceGestion;

  form!: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' tarif redevance de gestion';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  produits: Produit[] = [];

  constructor(
    private fb: FormBuilder,
    private tarifService: TarifRedevanceGestionService,
    private produitService: ProduitService,
    private dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<TarifRedevanceGestionCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.item = data?.item;
    this.data_operation = data?.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.item && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.item && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.item && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      this.form.disable({ emitEvent: false });
    }

    this.title = this.title + ' - ' + this.window_name;
  }

  loadData(): void {
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits ?? [];
    });
  }

  initForm_update(): void {
    this.form = this.fb.group({
      id: [this.item?.id],

      produit: [this.item?.produit, Validators.required],
      zone: [this.item?.zone ?? null],

      puissance_min: [this.item?.puissance_min ?? null],
      puissance_max: [this.item?.puissance_max ?? null],

      prix_unitaire: [this.item?.prix_unitaire, Validators.required],
      montant_min_reseau: [this.item?.montant_min_reseau ?? null],

      component_desc: [this.item?.component_desc ?? null]
    });
  }

  initForm_create(): void {
    this.form = this.fb.group({
      id: [''],

      produit: [null, Validators.required],
      zone: [null],

      puissance_min: [null],
      puissance_max: [null],

      prix_unitaire: [null, Validators.required],
      montant_min_reseau: [null],

      component_desc: [null]
    });
  }

  crud(): void {
    if (this.mode === this.operations.details) return;

    const v = this.form.value;

    // Payload request
    const payload: TarifRedevanceGestionRequest = {
      produit: v['produit'],
      zone: this.toNullableNumber(v['zone']),

      puissance_min: this.toNullableNumber(v['puissance_min']),
      puissance_max: this.toNullableNumber(v['puissance_max']),

      prix_unitaire: this.toNumber(v['prix_unitaire']) as any,
      montant_min_reseau: this.toNullableNumber(v['montant_min_reseau']),

      component_desc: (v['component_desc'] ?? null)
    };

    const id = v['id'];

    if (this.mode === operations.update) {
      this.tarifService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Tarif enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    } else if (this.mode === operations.create) {
      this.tarifService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Tarif enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    }
  }

  // Helpers (tolérant aux champs API string($decimal))
  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}
