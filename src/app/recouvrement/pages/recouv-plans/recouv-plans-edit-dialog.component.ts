import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RcvPlansApi } from '../../../rcv/endpoints/rcv-plans.api';
import { RcvStoreService } from '../../../rcv/rcv-store.service'; // ✅ NEW

export type RcvPlansEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; planId: number };

type ModeExecution = 'AUTO' | 'SEMI_AUTO' | 'MANU' | 'MANUEL'; // seed peut contenir MANUEL
type TypeAction = string; // seed: RELANCE_EMAIL, SUSPENSION_SERVICE, etc.

type CanalSeed = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';

@Component({
  selector: 'recouv-plans-edit-dialog',
  templateUrl: './recouv-plans-edit-dialog.component.html',
  styleUrls: ['./recouv-plans-edit-dialog.component.scss']
})
export class RecouvPlansEditDialogComponent {
  saving = false;

  planId?: number;
  etapes: any[] = [];

  readonly modeExecutions: ModeExecution[] = ['AUTO', 'SEMI_AUTO', 'MANU', 'MANUEL'];
  readonly typeActions: TypeAction[] = [
    'RELANCE_EMAIL',
    'RELANCE_SMS',
    'RELANCE_APPEL',
    'COURRIER',
    'SUSPENSION_SERVICE'
  ];

  form: FormGroup;
  etapeForm: FormGroup;

  editingEtapeId: number | null = null;

  templatesAll: any[] = [];
  templatesForSelect: any[] = [];

  templateLabelById: Record<number, string> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RcvPlansEditDialogData,
    private ref: MatDialogRef<RecouvPlansEditDialogComponent>,
    private fb: FormBuilder,
    private api: RcvPlansApi,
    private store: RcvStoreService, // ✅ NEW
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      priority: [0],
      actif: [true]
    });

    this.etapeForm = this.fb.group({
      type_action: ['', [Validators.required]],
      mode_execution: ['MANU' as ModeExecution, [Validators.required]],
      delai_jours: [0, [Validators.required]],
      template_id: [null],
      actif: [true]
    });

    // ✅ templates (une seule fois)
    this.loadTemplates();

    // ✅ filtre templates quand le type_action change
    this.etapeForm.get('type_action')?.valueChanges.subscribe(() => {
      this.recomputeTemplatesForSelect();

      // si template sélectionné n’est plus compatible => reset
      const currentTplId = this.etapeForm.get('template_id')?.value;
      if (currentTplId && !this.templatesForSelect.some(t => t.id === currentTplId)) {
        this.etapeForm.get('template_id')?.setValue(null);
      }
    });

    if (data.mode === 'edit') {
      const plan = this.api.get(data.planId);
      if (!plan) throw new Error(`Plan #${data.planId} introuvable`);

      this.planId = plan.id;
      this.form.patchValue({
        code: plan.code,
        nom: plan.nom,
        description: plan.description ?? '',
        priority: plan.priority ?? 0,
        actif: !!plan.actif
      });
      this.reloadEtapes();
    }
  }

  private loadTemplates(): void {
    this.templatesAll = (this.store.list<any>('templates') || [])
      .filter(t => !!t && t.actif === true);

    this.templateLabelById = {};
    this.templatesAll.forEach(t => {
      this.templateLabelById[t.id] = this.templateOptionLabel(t);
    });

    this.recomputeTemplatesForSelect();
  }

  private recomputeTemplatesForSelect(): void {
    const typeAction = this.etapeForm?.get('type_action')?.value;
    const canal = this.canalFromTypeAction(typeAction);

    if (!canal) {
      this.templatesForSelect = [...this.templatesAll];
      return;
    }

    this.templatesForSelect = this.templatesAll
      .filter(t => String(t.canal || '').toUpperCase() === canal);
  }

  private canalFromTypeAction(typeAction: string): CanalSeed | null {
    const t = String(typeAction || '').toUpperCase();
    if (t.includes('EMAIL')) return 'EMAIL';
    if (t.includes('SMS')) return 'SMS';
    if (t.includes('APPEL')) return 'APPEL';
    if (t.includes('COURRIER') || t.includes('LETTRE')) return 'LETTRE'; // seed legacy
    return null;
  }

  private normalizeCanalForDisplay(canal: string): string {
    const c = String(canal || '').toUpperCase();
    return c === 'LETTRE' ? 'COURRIER' : c;
  }

  templateOptionLabel(tpl: any): string {
    const canal = this.normalizeCanalForDisplay(tpl?.canal);
    return `${tpl?.nom} (${canal})`;
  }

  templateById(id: number | null | undefined): any | null {
    if (!id) return null;
    return this.templatesAll.find(t => t.id === id) ?? null;
  }

  close() { this.ref.close(false); }

  savePlan() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const v = this.form.value;
    const payload = {
      code: v.code,
      nom: v.nom,
      description: v.description,
      priority: Number(v.priority ?? 0),
      actif: !!v.actif
    };

    try {
      if (this.data.mode === 'create') {
        const created = this.api.create(payload);
        this.planId = created.id;
        this.reloadEtapes();
      } else {
        this.api.update(this.planId!, payload);
      }
      this.ref.close(true);
    } finally {
      this.saving = false;
    }
  }

  /* ===== Étapes ===== */
  reloadEtapes() {
    if (!this.planId) { this.etapes = []; return; }
    this.etapes = this.api.listEtapes(this.planId);
  }

  startAddEtape() {
    this.editingEtapeId = null;
    this.etapeForm.reset({
      type_action: '',
      mode_execution: 'MANU',
      delai_jours: 0,
      template_id: null,
      actif: true
    });
    this.recomputeTemplatesForSelect();
  }

  startEditEtape(row: any) {
    this.editingEtapeId = row.id;
    this.etapeForm.patchValue({
      type_action: row.type_action,
      mode_execution: row.mode_execution,
      delai_jours: row.delai_jours ?? 0,
      template_id: row.template_id ?? null,
      actif: !!row.actif
    });
    this.recomputeTemplatesForSelect();
  }

  cancelEtapeEdit() {
    this.editingEtapeId = null;
    this.etapeForm.reset({
      type_action: '',
      mode_execution: 'MANU',
      delai_jours: 0,
      template_id: null,
      actif: true
    });
    this.recomputeTemplatesForSelect();
  }

  saveEtape() {
    if (!this.planId) { alert('Veuillez d’abord enregistrer le plan.'); return; }
    if (this.etapeForm.invalid) { this.etapeForm.markAllAsTouched(); return; }

    const v = this.etapeForm.value;
    const payload = {
      type_action: v.type_action,
      mode_execution: v.mode_execution,
      delai_jours: Number(v.delai_jours ?? 0),
      template_id: v.template_id ?? null,
      actif: !!v.actif
    };

    if (this.editingEtapeId == null) this.api.addEtape(this.planId, payload);
    else this.api.updateEtape(this.editingEtapeId, payload);

    this.cancelEtapeEdit();
    this.reloadEtapes();
  }

  deleteEtape(row: any) {
    const ok = confirm(`Supprimer l’étape #${row.ordre} ?`);
    if (!ok) return;
    this.api.deleteEtape(row.id);
    this.reloadEtapes();
  }

  moveUp(row: any) {
    const idx = this.etapes.findIndex(x => x.id === row.id);
    if (idx <= 0) return;
    const ids = [...this.etapes.map(x => x.id)];
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    this.api.reorder(this.planId!, ids);
    this.reloadEtapes();
  }

  moveDown(row: any) {
    const idx = this.etapes.findIndex(x => x.id === row.id);
    if (idx < 0 || idx >= this.etapes.length - 1) return;
    const ids = [...this.etapes.map(x => x.id)];
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    this.api.reorder(this.planId!, ids);
    this.reloadEtapes();
  }



}
