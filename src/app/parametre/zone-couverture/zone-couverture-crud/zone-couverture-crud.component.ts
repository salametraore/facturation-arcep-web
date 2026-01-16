import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { ZoneCouverture, ZoneCouvertureDetailRequest } from '../../../shared/models/zone-couverture';

import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { ZoneCouvertureService } from '../../../shared/services/zone-couverture.service';

@Component({
  selector: 'app-zone-couverture-crud',
  templateUrl: './zone-couverture-crud.component.html'
})
export class ZoneCouvertureCrudComponent implements OnInit {
  zoneCouverture?: ZoneCouverture;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' zone de couverture';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private zoneCouvertureService: ZoneCouvertureService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<ZoneCouvertureCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    // ✅ important : on s'aligne sur ce que tu passes depuis la liste
    // dialogConfig.data = { zoneCouverture: zone, operation }
    this.zoneCouverture = data.zoneCouverture;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init(): void {
    if (this.zoneCouverture && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.zoneCouverture && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.zoneCouverture && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
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
      id: [this.zoneCouverture?.id],
      code: [this.zoneCouverture?.code, Validators.required],
      libelle: [this.zoneCouverture?.libelle, Validators.required],
      categorie_produit: [this.zoneCouverture?.categorie_produit, Validators.required]
    });

    // En mode détails, on peut aussi désactiver tout le form si tu veux
    if (this.data_operation === this.operations.details) {
      this.form.disable({ emitEvent: false });
    }
  }

  initForm_create(): void {
    this.form = this.formBuilder.group({
      id: [''], // optionnel (souvent géré par backend)
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      categorie_produit: ['', Validators.required]
    });
  }

  crud(): void {
    // ✅ payload attendu par API pour create/update
    const formValue = this.form.getRawValue(); // important si form.disable en details
    const payload: ZoneCouvertureDetailRequest = {
      code: formValue['code'],
      libelle: formValue['libelle'],
      categorie_produit: formValue['categorie_produit']
    };

    if (this.mode === operations.update) {
      const id = Number(formValue['id']);
      this.zoneCouvertureService.update(id, payload).subscribe(
        () => {
          this.msgMessageService.success('Zone de couverture enregistrée avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          // adapte si ton backend renvoie différemment
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
    } else if (this.mode === operations.create) {
      this.zoneCouvertureService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Zone de couverture enregistrée avec succès');
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
