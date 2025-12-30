import {Component, Inject, OnInit} from '@angular/core';
import {CategorieProduit} from "../../../shared/models/categorie-produit";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";
import {bouton_names, operations} from "../../../constantes";
import {Produit} from "../../../shared/models/produit";
import {ProduitService} from "../../../shared/services/produits.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";

@Component({
  selector: 'app-produit-crud',
  templateUrl: './produit-crud.component.html'
})
export class ProduitCrudComponent implements OnInit {

  produit?: Produit;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' produit';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  categorieProduits:CategorieProduit[];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private produitService: ProduitService,
    private categorieProduitService: CategorieProduitService,
    public dialogRef: MatDialogRef<ProduitCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private msgMessageService: MsgMessageServiceService,
  ) {
    this.produit = data.produit;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
  }

  init() {
    if (this.produit && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.produit && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout ';
      this.initForm_create();
    } else if (this.produit && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
    }
    this.title = this.title + ' - ' + this.window_name;
  }

  loadData(){
    this.categorieProduitService.getListItems().subscribe((categorieProduits: CategorieProduit[]) => {
      this.categorieProduits = categorieProduits;
    });
  }

  initForm_update() {
    this.form = this.formBuilder.group({
      id: [this.produit?.id],
      categorieProduit: [this.produit?.categorieProduit, Validators.required],
      libelle: [this.produit?.libelle, Validators.required],
      description: [this.produit?.description]
    });
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      id: [''],
      categorieProduit: ['', Validators.required],
      libelle: ['', Validators.required],
      description: [''],
    });
  }

  crud() {
    const produit = new Produit();
    const formValue = this.form.value;
    produit.id = formValue['id'];
    produit.libelle = formValue['libelle'];
    produit.description = formValue['description'];
    produit.categorieProduit = formValue['categorieProduit'];

    if (this.mode === operations.update) {
      this.produitService
        .update(produit.id, produit)
        .subscribe(
          (data) => {
            this.msgMessageService.success('Produit enregistrée avec succèss');
            this.dialogRef.close('Yes');
          },
          (error => {
            this.dialogService.alert({message: error.error.message});

            this.errorMessage = error.error.message;
          })
        );
    } else if (this.mode === operations.create) {
      this.produitService
        .create(produit)
        .subscribe(
          (data) => {
            this.msgMessageService.success('Produit enregistrée avec succèss');
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
