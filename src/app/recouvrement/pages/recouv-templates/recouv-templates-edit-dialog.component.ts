import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { RcvTemplatesApi } from '../../../rcv/endpoints/rcv-templates.api';

type Canal = 'EMAIL' | 'SMS' | 'COURRIER' | 'LETTRE';

export type RcvTemplateEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; templateId: number };

@Component({
  selector: 'recouv-templates-edit-dialog',
  templateUrl: './recouv-templates-edit-dialog.component.html',
  styleUrls: ['./recouv-templates-edit-dialog.component.scss']
})
export class RecouvTemplatesEditDialogComponent {
  saving = false;

  readonly canals: { value: 'EMAIL'|'SMS'|'COURRIER'|'APPEL'|'LETTRE'; label: string }[] = [
    { value: 'EMAIL', label: 'Email' },
    { value: 'SMS', label: 'SMS' },
    { value: 'APPEL', label: 'Appel' },
    { value: 'COURRIER', label: 'Courrier' },
    { value: 'LETTRE', label: 'Lettre (legacy seed)' },
  ];

  // Variables d’exemple pour la prévisualisation
  previewData = {
    client: 'ACME SA',
    refs: 'FAC_001, FAC_002',
    montant_total: '125 000',
    date_echeance: '2025-12-31',
    agent: 'Service Recouvrement'
  };


  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RcvTemplateEditDialogData,
    private ref: MatDialogRef<RecouvTemplatesEditDialogComponent>,
    private fb: FormBuilder,
    private api: RcvTemplatesApi
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      canal: ['SMS' as Canal, [Validators.required]],
      sujet: [''],
      contenu: ['', [Validators.required]],
      actif: [true],
      variables: [''] // JSON en string (optionnel)
    }, { validators: [this.variablesJsonValidator] });

    if (data.mode === 'edit') {
      const row = this.api.get(data.templateId);
      if (!row) throw new Error(`Template #${data.templateId} introuvable`);
      this.patch(row);
    }
  }

  private patch(row: any) {
    const canal = (row.canal || '').toUpperCase() === 'LETTRE' ? 'COURRIER' : row.canal;

    this.form.patchValue({
      code: row.code,
      nom: row.nom,
      canal,
      sujet: row.sujet ?? '',
      contenu: row.contenu ?? '',
      actif: !!row.actif,
      variables: row.variables ? JSON.stringify(row.variables, null, 2) : ''
    });
  }

  close() { this.ref.close(false); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const v = this.form.value;

    const payload: any = {
      code: v.code,
      nom: v.nom,
      canal: v.canal,
      sujet: (v.sujet || '').trim() || null,
      contenu: v.contenu,
      actif: !!v.actif,
      variables: this.parseJsonOrNull(v.variables)
    };

    try {
      if (this.data.mode === 'create') this.api.create(payload);
      else this.api.update(this.data.templateId, payload);
      this.ref.close(true);
    } finally {
      this.saving = false;
    }
  }

  /* ===== Prévisualisation ===== */
  renderPreview(text: string): string {
    if (!text) return '';
    return text.replace(/\{(\w+)\}/g, (_m, k) => {
      const val = (this.previewData as any)[k];
      return val != null ? String(val) : `{${k}}`;
    });
  }

  detectedVars(): string[] {
    const contenu = String(this.form.get('contenu')?.value ?? '');
    const subject = String(this.form.get('sujet')?.value ?? '');
    const all = `${subject}\n${contenu}`;
    const set = new Set<string>();
    all.replace(/\{(\w+)\}/g, (_m, k) => { set.add(k); return _m; });
    return Array.from(set).sort();
  }

  private parseJsonOrNull(s: string): any | null {
    const txt = (s || '').trim();
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }

  private variablesJsonValidator = (ctrl: AbstractControl): ValidationErrors | null => {
    const txt = String(ctrl.get('variables')?.value ?? '').trim();
    if (!txt) return null;
    try { JSON.parse(txt); return null; } catch { return { badJson: true }; }
  };
}
