import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RcvPlansApi } from '../../../rcv/endpoints/rcv-plans.api';
import { RcvStoreService } from '../../../rcv/rcv-store.service';

export type RcvPlansEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; planId: number };

// ✅ enums demandés
export type TypeActionEnum = 'EMAIL' | 'SMS' | 'COURRIER' | 'APPEL';
export type ModeExecutionEnum = 'AUTO' | 'SEMI_AUTO' | 'MANU';
export type TypeDelaiEnum = 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';

// seed templates (peut contenir LETTRE)
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

  // ✅ listes UI
  readonly typeActions: TypeActionEnum[] = ['EMAIL', 'SMS', 'APPEL', 'COURRIER'];
  readonly modeExecutions: ModeExecutionEnum[] = ['AUTO', 'SEMI_AUTO', 'MANU'];
  readonly typeDelais: Array<{ value: TypeDelaiEnum; label: string }> = [
    { value: 'AVANT_ECHEANCE', label: 'Avant échéance' },
    { value: 'APRES_ECHEANCE', label: 'Après échéance' }
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
    private store: RcvStoreService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      priority: [0],
      actif: [true]
    });

    // ✅ IMPORTANT: on standardise "template" = ID (number|null)
    this.etapeForm = this.fb.group({
      type_action: ['' as TypeActionEnum | '', [Validators.required]],
      mode_execution: ['MANU' as ModeExecutionEnum, [Validators.required]],
      type_delai: ['APRES_ECHEANCE' as TypeDelaiEnum, [Validators.required]],
      nb_jours: [0, [Validators.required, Validators.min(0)]],
      template: [null as number | null],
      actif: [true]
    });

    // ✅ templates (une seule fois)
    this.loadTemplates();

    // ✅ filtre templates quand le type_action change
    this.etapeForm.get('type_action')?.valueChanges.subscribe(() => {
      this.recomputeTemplatesForSelect();

      const currentTplId = this.etapeForm.get('template')?.value;
      if (currentTplId && !this.templatesForSelect.some(t => t.id === currentTplId)) {
        this.etapeForm.get('template')?.setValue(null);
      }
    });

    if (data.mode === 'edit') {
      this.saving = true;
      this.api.get(data.planId).subscribe({
        next: (plan: any) => {
          this.planId = plan.id;
          this.form.patchValue({
            code: plan.code,
            nom: plan.nom,
            description: plan.description ?? '',
            priority: plan.priority ?? 0,
            actif: !!plan.actif
          });
          this.reloadEtapes();
        },
        error: () => alert(`Plan #${data.planId} introuvable`),
        complete: () => (this.saving = false)
      });
    }
  }

  /* ===== Labels UI ===== */
  actionLabel(a: TypeActionEnum): string {
    switch (a) {
      case 'EMAIL': return 'Email';
      case 'SMS': return 'SMS';
      case 'APPEL': return 'Appel';
      case 'COURRIER': return 'Courrier';
    }
  }

  modeLabel(m: ModeExecutionEnum): string {
    switch (m) {
      case 'AUTO': return 'Automatique';
      case 'SEMI_AUTO': return 'Semi-automatique';
      case 'MANU': return 'Manuel';
    }
  }

  typeDelaiLabel(v: TypeDelaiEnum): string {
    return v === 'AVANT_ECHEANCE' ? 'Avant échéance' : 'Après échéance';
  }

  /* ===== Templates ===== */
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
    const typeAction = this.etapeForm?.get('type_action')?.value as TypeActionEnum | '';
    const canal = this.canalFromTypeAction(typeAction);

    if (!canal) {
      this.templatesForSelect = [...this.templatesAll];
      return;
    }

    this.templatesForSelect = this.templatesAll.filter(t => {
      const tplCanal = this.normalizeCanalForCompare(t?.canal);
      return tplCanal === canal;
    });
  }

  private canalFromTypeAction(typeAction: TypeActionEnum | '' | null | undefined): CanalSeed | null {
    if (!typeAction) return null;
    // ✅ "COURRIER" correspond aux templates "LETTRE" côté seed legacy
    return typeAction === 'COURRIER'
      ? 'LETTRE'
      : (typeAction as Exclude<TypeActionEnum, 'COURRIER'>);
  }

  private normalizeCanalForCompare(canal: any): CanalSeed {
    const c = String(canal || '').toUpperCase();
    if (c === 'COURRIER') return 'LETTRE';
    if (c === 'LETTRE') return 'LETTRE';
    if (c === 'EMAIL') return 'EMAIL';
    if (c === 'SMS') return 'SMS';
    if (c === 'APPEL') return 'APPEL';
    return 'LETTRE';
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

  /* ===== Plan ===== */
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

    const req$ = (this.data.mode === 'create')
      ? this.api.create(payload)
      : this.api.update(this.planId!, payload);

    req$.subscribe({
      next: (res: any) => {
        if (this.data.mode === 'create') {
          this.planId = res?.id;
          this.reloadEtapes();
        }
        this.ref.close(true);
      },
      error: (e: any) => {
        console.error(e);
        this.saving = false;
        alert('Enregistrement impossible');
      }
    });
  }

  /* ===== Étapes ===== */
  reloadEtapes() {
    if (!this.planId) { this.etapes = []; return; }

    this.api.listEtapes(this.planId).subscribe({
      next: (rows: any[]) => {
        // ✅ on normalise au format attendu par l’écran
        this.etapes = (rows || []).map(r => {
          const templateId =
            typeof r?.template === 'object' ? r.template?.id :
              (r?.template ?? r?.template_id ?? null);

          const nbJours = r?.nb_jours ?? r?.delai_jours ?? 0;

          return {
            ...r,
            template: templateId,
            nb_jours: nbJours
          };
        });
      },
      error: () => alert('Chargement étapes impossible')
    });
  }

  startAddEtape() {
    this.editingEtapeId = null;
    this.etapeForm.reset({
      type_action: '',
      mode_execution: 'MANU',
      type_delai: 'APRES_ECHEANCE',
      nb_jours: 0,
      template: null,
      actif: true
    });
    this.recomputeTemplatesForSelect();
  }

  startEditEtape(row: any) {
    this.editingEtapeId = row.id;

    const templateId =
      typeof row?.template === 'object' ? row.template?.id :
        (row?.template ?? row?.template_id ?? null);

    this.etapeForm.patchValue({
      type_action: row.type_action,
      mode_execution: row.mode_execution,
      type_delai: row.type_delai,
      nb_jours: row.nb_jours ?? row.delai_jours ?? 0,
      template: templateId,
      actif: !!row.actif
    });

    this.recomputeTemplatesForSelect();
  }

  cancelEtapeEdit() {
    this.editingEtapeId = null;
    this.etapeForm.reset({
      type_action: '',
      mode_execution: 'MANU',
      type_delai: 'APRES_ECHEANCE',
      nb_jours: 0,
      template: null,
      actif: true
    });
    this.recomputeTemplatesForSelect();
  }

  saveEtape() {
    if (!this.planId) { alert('Veuillez d’abord enregistrer le plan.'); return; }
    if (this.etapeForm.invalid) { this.etapeForm.markAllAsTouched(); return; }

    const v = this.etapeForm.value;

    const payload = {
      type_action: v.type_action as TypeActionEnum,
      mode_execution: v.mode_execution as ModeExecutionEnum,
      type_delai: v.type_delai as TypeDelaiEnum,
      nb_jours: Number(v.nb_jours ?? 0),
      template: v.template ?? null,
      actif: !!v.actif
    };

    const req$ = (this.editingEtapeId == null)
      ? this.api.addEtape(this.planId, payload)
      : this.api.updateEtape(this.editingEtapeId, { ...payload, plan_action: this.planId });

    req$.subscribe({
      next: () => { this.cancelEtapeEdit(); this.reloadEtapes(); },
      error: () => alert('Enregistrement étape impossible')
    });
  }

  deleteEtape(row: any) {
    const ok = confirm(`Supprimer l’étape #${row.ordre} ?`);
    if (!ok) return;

    this.api.deleteEtape(row.id).subscribe({
      next: () => this.reloadEtapes(),
      error: () => alert('Suppression impossible')
    });
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
