import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {AVIS, bouton_names, date_converte, operations} from "../../constantes";
import {RetraitAutorisationRequest, FicheTechniques} from "../../shared/models/ficheTechniques";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {CategorieProduit} from "../../shared/models/categorie-produit";

@Component({
  selector: 'retrait-autorisation-dialog',
  templateUrl: './retrait-autorisation-dialog.component.html',
  styleUrl: './retrait-autorisation-dialog.component.scss'
})
export class RetraitAutorisationDialogComponent implements OnInit {

  ficheTechnique?: FicheTechniques;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' produit';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  statutFicheTechniques: StatutFicheTechnique[];
  categorieProduits: CategorieProduit[];
  avisChoices= AVIS;

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private categorieService: CategorieProduitService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<RetraitAutorisationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private msgMessageService: MsgMessageServiceService,
  ) {
    this.ficheTechnique = data.ficheTechnique;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {

    this.statutFicheTechniqueService.getListItems().subscribe((data:FicheTechniques[])=>{
      this.statutFicheTechniques = data;
    });

    this.categorieService.getListItems().subscribe((categorieProduits:CategorieProduit[])=>{
      this.categorieProduits = categorieProduits;
      this.form.get('categorie_produit')?.setValue(this.categorieProduits?.find(c=>c.id===this.ficheTechnique?.categorie_produit)?.libelle);
    });

    this.initForm_update();
  }

  /*
        date_retrait: [this.ficheTechnique?.date_retrait],
      motif_retrait: [this.ficheTechnique?.motif_retrait],
   */
  initForm_update() {
    this.form = this.formBuilder.group({
      client :[this.ficheTechnique?.client_nom],
      categorie_produit :[this.ficheTechnique?.categorie_produit],
      objet : [this.ficheTechnique?.objet],
      commentaire : [this.ficheTechnique?.commentaire],
      date_retrait: [''],
      motif_retrait: [''],
    });

  }

  initForm_create() {
    this.form = this.formBuilder.group({
      date_retrait: [''],
      motif_retrait: [''],
    });

  }



  crud() {
    const retraitAutorisationRequest: RetraitAutorisationRequest = new RetraitAutorisationRequest();
    const formValue = this.form.value;
    retraitAutorisationRequest.fiche_technique = this.ficheTechnique?.id;
    retraitAutorisationRequest.date_retrait = date_converte(formValue['date_retrait']);
    retraitAutorisationRequest.motif_retrait = formValue['motif_retrait'];

    console.log(retraitAutorisationRequest);
    this.ficheTechniquesService
      .retraitAutorisation(retraitAutorisationRequest)
      .subscribe(
        (data) => {
          this.msgMessageService.success('Retrait autorisation effectuée avec succèss');
          this.dialogRef.close('Yes');
        },
        (error => {
          this.dialogService.alert({message: error.error.message});

          this.errorMessage = error.error.message;
        })
      );
  }
}
