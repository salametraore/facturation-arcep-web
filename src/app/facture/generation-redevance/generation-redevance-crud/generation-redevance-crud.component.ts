import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl,FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { FactureService } from '../../../shared/services/facture.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import {bouton_names, date_converte, operations} from "../../../constantes";
import {MatSnackBar} from "@angular/material/snack-bar";


type GenRedForm = FormGroup<{
  categorie: FormControl<number | null>;
  annee: FormControl<number>;
}>;

@Component({
  selector: 'generation-redevance-crud',
  templateUrl: './generation-redevance-crud.component.html',
  styleUrls: ['./generation-redevance-crud.component.scss']
})
export class GenerationRedevanceCrudComponent implements OnInit {


  categories: CategorieProduit[] = [];

  form!: GenRedForm;

  isLoading = false;
  generated = false;

  constructor(
    private fb: FormBuilder,
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<GenerationRedevanceCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories?: CategorieProduit[] }
  ) {}

  ngOnInit() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    this.form = new FormGroup({
      categorie: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
      annee: new FormControl<number>(new Date().getFullYear(), {
        nonNullable: true,
        validators: [Validators.required, Validators.min(2000), Validators.max(2100)]
      }),
    });
  }

  submit() {
    if (this.form.invalid || this.generated) return;
    const categorie = this.form.controls.categorie.value!;
    const annee = this.form.controls.annee.value;

    this.isLoading = true;

    this.factureService.genererRedevancesAnnuelles(categorie, annee).subscribe({
      next: () => {
        this.isLoading = false;
        this.generated = true; // => désactive le bouton
        this.snack.open('Génération terminée avec succès 🎉', 'OK', { duration: 3000 });
        // On NE ferme PAS la modale ici, pour respecter le besoin:
        // "Il faut quitter la fenêtre modale et relancer pour réactiver le bouton"
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open(
          err?.error?.message || 'Échec de la génération. Réessayez.',
          'Fermer',
          { duration: 4000 }
        );
      }
    });
  }

  fermer() {
    this.dialogRef.close(true);
  }


}
