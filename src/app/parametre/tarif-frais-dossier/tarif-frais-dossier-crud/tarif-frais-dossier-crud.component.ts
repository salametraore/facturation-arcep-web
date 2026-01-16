// src/app/features/parametrage/tarif-frais-dossier/tarif-frais-dossier-crud/tarif-frais-dossier-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { TarifFraisDossier, TarifFraisDossierRequest } from '../../../shared/models/tarif-frais-dossier.model';
import { TarifFraisDossierService } from '../../../shared/services/tarif-frais-dossier.service';

import { Produit } from '../../../shared/models/produit';
import { ProduitService } from '../../../shared/services/produits.service';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'app-tarif-frais-dossier-crud',
  templateUrl: './tarif-frais-dossier-crud.component.html'
})
export class TarifFraisDossierCrudComponent implements OnInit {

  item?: TarifFraisDossier;          // élément en édition/affichage
  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' tarif frais de dossier';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  produits: Produit[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private tarifService: TarifFraisDossierService,
    private produitService: ProduitService,
    public dialogRef: MatDialogRef<TarifFraisDossierCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // 🔁 la page liste a envoyé dialogConfig.data = { item, operation }
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
      this.form.disable(); // ✅ lecture seule
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

      quantite_min: [this.item?.quantite_min],
      quantite_max: [this.item?.quantite_max],

      prix_unitaire: [this.item?.prix_unitaire, Validators.required],

      // champs présents dans la request (pas forcément renvoyés dans la liste)
      montant_max_par_dossier: [null],
      zone: [null]
    });
  }

  initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      produit: ['', Validators.required],

      quantite_min: [null],
      quantite_max: [null],

      prix_unitaire: [null, Validators.required],

      montant_max_par_dossier: [null],
      zone: [null]
    });
  }

  /** Construction du payload conforme à TarifFraisDossierRequest */
  private buildRequest(): TarifFraisDossierRequest {
    const v = this.form.value;

    const req: TarifFraisDossierRequest = {
      produit: v['produit'],
      quantite_min: v['quantite_min'] ?? undefined,
      quantite_max: v['quantite_max'] ?? undefined,
      prix_unitaire: v['prix_unitaire'],
      montant_max_par_dossier: v['montant_max_par_dossier'] ?? undefined,
      zone: v['zone'] ?? undefined
    };

    return req;
  }

  crud(): void {
    const req = this.buildRequest();
    const id = this.form.value['id'];

    if (this.mode === operations.update) {
      this.tarifService.update(id, req).subscribe(
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
      this.tarifService.create(req).subscribe(
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
}
