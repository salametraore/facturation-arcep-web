import {Component, Inject, OnInit} from '@angular/core';
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {bouton_names, operations} from "../../../constantes";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";

@Component({
  selector: 'app-categorie-produit-crud',
  templateUrl: './categorie-produit-crud.component.html',
  styleUrl: './categorie-produit-crud.component.scss'
})
export class CategorieProduitCrudComponent implements OnInit {

  categorieProduit?: CategorieProduit;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = 'Catégorie de produit';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<CategorieProduitCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private msgMessageService: MsgMessageServiceService,
  ) {
    this.categorieProduit = data.categorieProduit;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    if (this.categorieProduit && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.categorieProduit && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.categorieProduit && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  initForm_update() {
    this.form = this.formBuilder.group({
      code: [this.categorieProduit?.code, Validators.required],
      libelle: [this.categorieProduit?.libelle, Validators.required],
      description: [this.categorieProduit?.description]
    });
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      description: [''],
    });
  }

  crud() {
    const categorieProduit = new CategorieProduit();
    const formValue = this.form.value;
    categorieProduit.id = this.categorieProduit?.id;
    categorieProduit.code = formValue['code'];
    categorieProduit.libelle = formValue['libelle'];
    categorieProduit.description = formValue['description'];

    if (this.mode === operations.update) {
      this.categorieProduitService
        .update(categorieProduit.id, categorieProduit)
        .subscribe(
          (data) => {
            this.msgMessageService.success('Catégorie de produit enregistrée avec succèss');
            this.dialogRef.close('Yes');
          },
          (error => {
            this.dialogService.alert({message: error.error.message});

            this.errorMessage = error.error.message;
          })
        );
    } else if (this.mode === operations.create) {
      this.categorieProduitService
        .create(categorieProduit)
        .subscribe(
          (data) => {
            this.msgMessageService.success('Catégorie de produit enregistrée avec succèss');
            this.dialogRef.close('Yes');
          },
          (error => {
            this.dialogService.alert({message: error});

            this.errorMessage = error.error.message;
          })
        );
    }

  }
}
