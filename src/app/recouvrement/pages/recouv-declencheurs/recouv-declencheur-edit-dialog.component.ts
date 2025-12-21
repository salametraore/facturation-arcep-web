import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import {
  RcvDeclencheur,
  RcvDeclencheurUpsert,
  RcvTypeClient,
  RcvTypeDelai,
  criteresToDelai,
  delaiToCriteresPatch
} from '../../models/rcv-declencheur.models';

import { RcvDeclencheursApi } from '../../../rcv/endpoints/rcv-declencheurs.api';

export type RcvDeclencheurEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; row: RcvDeclencheur };

@Component({
  selector: 'recouv-declencheur-edit-dialog',
  templateUrl: './recouv-declencheur-edit-dialog.component.html',
  styleUrls: ['./recouv-declencheur-edit-dialog.component.scss'],
})
export class RecouvDeclencheurEditDialogComponent {

  readonly typeClients: RcvTypeClient[] = ['ENTREPRISE', 'PME', 'PUBLIC', 'PARTICULIER'];
  readonly typeDelais: { value: RcvTypeDelai; label: string }[] = [
    { value: 'AVANT', label: 'Avant échéance' },
    { value: 'APRES', label: 'Après échéance' },
  ];

  // TODO: brancher vraies sources
  readonly produits: string[] = ['SVC_TV', 'SVC_INTERNET', 'SVC_MOBILE'];
  readonly groupes: { id: number; label: string }[] = [
    { id: 1, label: 'Groupe #1' },
    { id: 2, label: 'Groupe #2' },
    { id: 3, label: 'Groupe #3' },
  ];

  saving = false;

  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RcvDeclencheurEditDialogData,
    private ref: MatDialogRef<RecouvDeclencheurEditDialogComponent>,
    private fb: FormBuilder,
    private api: RcvDeclencheursApi
  ) {
    this.form = this.buildForm();

    if (data.mode === 'edit') this.patch(data.row);
  }

  private buildForm(): FormGroup {
    return this.fb.group(
      {
        code: ['', [Validators.required, Validators.maxLength(50)]],
        nom: ['', [Validators.required, Validators.maxLength(255)]],
        description: [''],
        groupe_id: [null, [Validators.required]],
        plan_action_id: [null],
        actif: [true],

        type_client: [[] as RcvTypeClient[]],
        produit_code: [[] as string[]],
        montant_min: [null],
        montant_max: [null],
        nb_factures_impayees_min: [null],

        type_delai: ['APRES' as RcvTypeDelai],
        nb_jours: [0, [Validators.required, Validators.min(0)]],
      },
      { validators: [this.minMaxValidator] }
    );
  }

  private patch(row: RcvDeclencheur) {
    const { typeDelai, nbJours } = criteresToDelai(row.criteres);

    this.form.patchValue({
      code: row.code,
      nom: row.nom,
      description: row.description ?? '',
      groupe_id: row.groupe_id,
      plan_action_id: row.plan_action_id ?? null,
      actif: row.actif,

      type_client: row.criteres?.type_client ?? [],
      produit_code: row.criteres?.produit_code ?? [],
      montant_min: row.criteres?.montant_min ?? null,
      montant_max: row.criteres?.montant_max ?? null,
      nb_factures_impayees_min: row.criteres?.nb_factures_impayees_min ?? null,

      type_delai: typeDelai,
      nb_jours: nbJours,
    });
  }

  close() { this.ref.close(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const v = this.form.value;

    const criteres: any = {
      type_client: (v.type_client?.length ? v.type_client : undefined),
      produit_code: (v.produit_code?.length ? v.produit_code : undefined),
      montant_min: v.montant_min ?? null,
      montant_max: v.montant_max ?? null,
      nb_factures_impayees_min: v.nb_factures_impayees_min ?? null,
      ...delaiToCriteresPatch(v.type_delai, v.nb_jours),
    };

    Object.keys(criteres).forEach(k => criteres[k] === undefined && delete criteres[k]);

    const payload: RcvDeclencheurUpsert = {
      code: v.code,
      nom: v.nom,
      description: v.description,
      groupe_id: v.groupe_id,
      plan_action_id: v.plan_action_id ?? undefined,
      actif: !!v.actif,
      criteres,
    };

    try {
      if (this.data.mode === 'create') this.api.create(payload);
      else this.api.update(this.data.row.id, payload);

      this.ref.close(true);
    } finally {
      this.saving = false;
    }
  }

  private minMaxValidator(group: AbstractControl): ValidationErrors | null {
    const min = group.get('montant_min')?.value;
    const max = group.get('montant_max')?.value;
    if (min != null && max != null && Number(min) > Number(max)) return { minMax: true };
    return null;
  }
}
