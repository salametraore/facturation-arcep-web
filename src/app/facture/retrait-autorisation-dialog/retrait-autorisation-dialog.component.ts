import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';
import { bouton_names, date_converte } from '../../constantes';
import {
  RetraitAutorisationRequest,
  FicheTechniques,
  DesactiverFicheTechniqueProduit
} from '../../shared/models/ficheTechniques';
import { FicheTechniquesService } from '../../shared/services/fiche-techniques.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';
import { CategorieProduit } from '../../shared/models/categorie-produit';
import { FicheTechniqueProduit } from '../../shared/models/ficheTechniquesProduits';

type ModeRetrait = 'GLOBAL' | 'PARTIEL';

@Component({
  selector: 'retrait-autorisation-dialog',
  templateUrl: './retrait-autorisation-dialog.component.html'
})
export class RetraitAutorisationDialogComponent implements OnInit, OnDestroy {

  ficheTechnique?: FicheTechniques;
  form!: FormGroup;
  errorMessage: string = '';
  categorieProduits: CategorieProduit[] = [];

  public bouton_names = bouton_names;

  private destroy$ = new Subject<void>();

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private categorieService: CategorieProduitService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<RetraitAutorisationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.ficheTechnique = data?.ficheTechnique;
  }

  ngOnInit(): void {
    this.initForm();
    this.bindModeChanges();
    this.loadCategories();
    this.updateModeValidators(this.modeRetrait);
  }

  get modeRetrait(): ModeRetrait {
    return (this.form?.get('mode_retrait')?.value ?? 'GLOBAL') as ModeRetrait;
  }

  get produitsActifs(): FicheTechniqueProduit[] {
    return (this.ficheTechnique?.produits_detail ?? []).filter(p => p.actif !== false);
  }

  get submitLabel(): string {
    return this.modeRetrait === 'GLOBAL'
      ? 'Valider le retrait global'
      : 'Désactiver les produits';
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      mode_retrait: ['GLOBAL', Validators.required],

      client: [{ value: this.ficheTechnique?.client_nom ?? '', disabled: true }],
      categorie_produit: [{ value: '', disabled: true }],
      objet: [{ value: this.ficheTechnique?.objet ?? '', disabled: true }],
      commentaire: [{ value: this.ficheTechnique?.commentaire ?? '', disabled: true }],

      date_retrait: ['', Validators.required],
      motif_retrait: ['', [Validators.required, Validators.maxLength(500)]],

      fiche_produits: [[]]
    });
  }

  private bindModeChanges(): void {
    this.form.get('mode_retrait')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode: ModeRetrait) => {
        this.updateModeValidators(mode);
      });
  }

  private updateModeValidators(mode: ModeRetrait): void {
    const ficheProduitsCtrl = this.form.get('fiche_produits');

    if (!ficheProduitsCtrl) {
      return;
    }

    if (mode === 'PARTIEL') {
      ficheProduitsCtrl.setValidators([Validators.required]);
    } else {
      ficheProduitsCtrl.clearValidators();
      ficheProduitsCtrl.setValue([]);
    }

    ficheProduitsCtrl.updateValueAndValidity();
  }

  private loadCategories(): void {
    this.categorieService.getListItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorieProduits: CategorieProduit[]) => {
          this.categorieProduits = categorieProduits;

          const categorie = this.categorieProduits.find(
            c => c.id === this.ficheTechnique?.categorie_produit
          );

          this.form.get('categorie_produit')?.setValue(categorie?.libelle ?? '');
        },
        error: (error) => {
          console.error('Erreur chargement catégories', error);
        }
      });
  }

  crud(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.ficheTechnique?.id) {
      this.dialogService.alert({ message: 'Fiche technique introuvable.' });
      return;
    }

    if (this.modeRetrait === 'GLOBAL') {
      this.retraitGlobal();
      return;
    }

    if (this.modeRetrait === 'PARTIEL') {
      this.desactiverProduits();
      return;
    }
  }

  private retraitGlobal(): void {
    const formValue = this.form.getRawValue();

    const payload: RetraitAutorisationRequest = new RetraitAutorisationRequest();
    payload.fiche_technique = this.ficheTechnique?.id;
    payload.date_retrait = date_converte(formValue.date_retrait);
    payload.motif_retrait = formValue.motif_retrait;

    this.ficheTechniquesService
      .retraitAutorisation(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.msgMessageService.success('Retrait global effectué avec succès');
          this.dialogRef.close('Yes');
        },
        error: (error) => {
          const message = error?.error?.message || 'Erreur lors du retrait global.';
          this.dialogService.alert({ message });
          this.errorMessage = message;
        }
      });
  }

  private desactiverProduits(): void {
    const formValue = this.form.getRawValue();
    const produitsSelectionnes: number[] = formValue.fiche_produits ?? [];

    if (!produitsSelectionnes.length) {
      this.dialogService.alert({
        message: 'Veuillez sélectionner au moins un produit à désactiver.'
      });
      return;
    }

      const payload: DesactiverFicheTechniqueProduit = {
        fiche_technique_id: this.ficheTechnique!.id!,
        fiche_produits: produitsSelectionnes,
        date_retrait: date_converte(formValue.date_retrait),
        motif_retrait: formValue.motif_retrait
      };


    this.ficheTechniquesService
      .desactiverProduits(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.msgMessageService.success('Désactivation des produits effectuée avec succès');
          this.dialogRef.close('Yes');
        },
        error: (error) => {
          const message = error?.error?.message || 'Erreur lors de la désactivation des produits.';
          this.dialogService.alert({ message });
          this.errorMessage = message;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
