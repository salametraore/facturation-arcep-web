import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { RcvPlansApi } from '../../../rcv/endpoints/rcv-plans.api';
import {
  TypeActionEnum,
  ModeExecutionEnum,
  TypeDelaiEnum
} from '../../../shared/models/recouv-plan-etape';
import { RcvTemplatesApi } from '../../../rcv/endpoints/rcv-templates.api';

export type RcvPlansEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; planId: number };

type CanalSeed = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';
type DialogMode = 'create' | 'edit';
type UiMessageType = 'success' | 'error' | 'info';

@Component({
  selector: 'recouv-plans-edit-dialog',
  templateUrl: './recouv-plans-edit-dialog.component.html',
  styleUrls: ['./recouv-plans-edit-dialog.component.scss']
})
export class RecouvPlansEditDialogComponent {
  saving = false;
  savingEtape = false;
  loadingEtapes = false;
  loadingTemplates = false;

  planId?: number;
  etapes: any[] = [];

  dialogMode: DialogMode;
  selectedTabIndex = 0;

  uiMessage: string | null = null;
  uiMessageType: UiMessageType = 'info';

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
    private apiTemplates: RcvTemplatesApi
  ) {
    this.dialogMode = data.mode;

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      priority: [0],
      actif: [true]
    });

    this.etapeForm = this.fb.group({
      type_action: ['' as TypeActionEnum | '', [Validators.required]],
      mode_execution: ['MANU' as ModeExecutionEnum, [Validators.required]],
      type_delai: ['APRES_ECHEANCE' as TypeDelaiEnum, [Validators.required]],
      nb_jours: [0, [Validators.required, Validators.min(0)]],
      template: [null as number | null],
      actif: [true]
    });

    this.loadTemplates();

    this.etapeForm.get('type_action')?.valueChanges.subscribe(() => {
      this.recomputeTemplatesForSelect();

      const currentTplId = this.etapeForm.get('template')?.value;
      if (currentTplId && !this.templatesForSelect.some(t => t.id === currentTplId)) {
        this.etapeForm.get('template')?.setValue(null);
      }
    });

    if (data.mode === 'edit') {
      this.saving = true;
      this.api.get(data.planId).pipe(take(1)).subscribe({
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
        error: () => {
          this.saving = false;
          this.showMessage(`Plan #${data.planId} introuvable`, 'error');
        },
        complete: () => {
          this.saving = false;
        }
      });
    }
  }

  private showMessage(message: string, type: UiMessageType = 'info'): void {
    this.uiMessage = message;
    this.uiMessageType = type;
  }

  clearMessage(): void {
    this.uiMessage = null;
  }

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

  private loadTemplates(): void {
    this.loadingTemplates = true;

    this.apiTemplates.getItems().pipe(take(1)).subscribe({
      next: (rows: any[]) => {
        this.templatesAll = (rows || []).filter(t => !!t && t.actif === true);

        this.templateLabelById = {};
        this.templatesAll.forEach(t => {
          this.templateLabelById[t.id] = this.templateOptionLabel(t);
        });

        this.recomputeTemplatesForSelect();

        const currentTplId = this.etapeForm.get('template')?.value;
        if (currentTplId && !this.templatesAll.some(t => t.id === currentTplId)) {
          this.etapeForm.get('template')?.setValue(null);
        }
      },
      error: (e: any) => {
        console.error(e);
        this.templatesAll = [];
        this.templatesForSelect = [];
        this.templateLabelById = {};
        this.showMessage('Chargement des modèles impossible.', 'error');
      },
      complete: () => {
        this.loadingTemplates = false;
      }
    });
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

  close(): void {
    if (this.saving || this.savingEtape) return;
    this.ref.close(false);
  }

  savePlan(): void {
    if (this.saving) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.clearMessage();

    const v = this.form.value;
    const payload = {
      code: v.code,
      nom: v.nom,
      description: v.description,
      priority: Number(v.priority ?? 0),
      actif: !!v.actif
    };

    const req$ = this.dialogMode === 'create'
      ? this.api.create(payload)
      : this.api.update(this.planId!, payload);

    req$.pipe(take(1)).subscribe({
      next: (res: any) => {
        if (this.dialogMode === 'create') {
          this.planId = res?.id;
          this.dialogMode = 'edit';
          this.selectedTabIndex = 1;
          this.reloadEtapes();
          this.showMessage(
            'Plan enregistré avec succès. Vous pouvez maintenant ajouter des étapes.',
            'success'
          );
          return;
        }

        this.showMessage('Plan mis à jour avec succès.', 'success');
        this.ref.close(true);
      },
      error: (e: any) => {
        console.error(e);
        this.showMessage('Enregistrement impossible.', 'error');
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  reloadEtapes(): void {
    if (!this.planId) {
      this.etapes = [];
      return;
    }

    this.loadingEtapes = true;

    this.api.listEtapes(this.planId).pipe(take(1)).subscribe({
      next: (rows: any[]) => {
        this.etapes = (rows || []).map(r => {
          const templateId =
            typeof r?.template === 'object'
              ? r.template?.id
              : (r?.template ?? r?.template_id ?? null);

          const nbJours = r?.nb_jours ?? r?.delai_jours ?? 0;

          return {
            ...r,
            template: templateId,
            nb_jours: nbJours
          };
        });
      },
      error: () => this.showMessage('Chargement des étapes impossible.', 'error'),
      complete: () => {
        this.loadingEtapes = false;
      }
    });
  }

  startAddEtape(): void {
    this.editingEtapeId = null;
    this.selectedTabIndex = 1;
    this.clearMessage();

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

  startEditEtape(row: any): void {
    this.editingEtapeId = row.id;
    this.selectedTabIndex = 1;
    this.clearMessage();

    const templateId =
      typeof row?.template === 'object'
        ? row.template?.id
        : (row?.template ?? row?.template_id ?? null);

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

  cancelEtapeEdit(): void {
    if (this.savingEtape) return;

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

  saveEtape(): void {
    if (this.savingEtape) return;

    if (!this.planId) {
      this.showMessage('Veuillez d’abord enregistrer le plan.', 'info');
      return;
    }

    if (this.etapeForm.invalid) {
      this.etapeForm.markAllAsTouched();
      return;
    }

    this.savingEtape = true;
    this.clearMessage();

    const v = this.etapeForm.value;

    const payload = {
      type_action: v.type_action as TypeActionEnum,
      mode_execution: v.mode_execution as ModeExecutionEnum,
      type_delai: v.type_delai as TypeDelaiEnum,
      nb_jours: Number(v.nb_jours ?? 0),
      template: v.template ?? null,
      actif: !!v.actif
    };

    const isEdit = this.editingEtapeId != null;

    const req$ = isEdit
      ? this.api.updateEtape(this.editingEtapeId!, { ...payload, plan_action: this.planId })
      : this.api.addEtape(this.planId, payload);

    req$.pipe(take(1)).subscribe({
      next: () => {
        this.cancelEtapeEdit();
        this.reloadEtapes();
        this.showMessage(
          isEdit ? 'Étape mise à jour avec succès.' : 'Étape ajoutée avec succès.',
          'success'
        );
      },
      error: (e: any) => {
        console.error(e);
        this.showMessage('Enregistrement étape impossible.', 'error');
      },
      complete: () => {
        this.savingEtape = false;
      }
    });
  }

  deleteEtape(row: any): void {
    if (this.savingEtape) return;

    const ok = confirm(`Supprimer l’étape #${row.ordre} ?`);
    if (!ok) return;

    this.savingEtape = true;
    this.clearMessage();

    this.api.deleteEtape(row.id).pipe(take(1)).subscribe({
      next: () => {
        this.reloadEtapes();
        this.showMessage('Étape supprimée avec succès.', 'success');
      },
      error: () => this.showMessage('Suppression impossible.', 'error'),
      complete: () => {
        this.savingEtape = false;
      }
    });
  }

  moveUp(row: any): void {
    const idx = this.etapes.findIndex(x => x.id === row.id);
    if (idx <= 0 || !this.planId) return;

    const ids = [...this.etapes.map(x => x.id)];
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];

    this.api.reorder(this.planId, ids).pipe(take(1)).subscribe({
      next: () => {
        this.reloadEtapes();
        this.showMessage('Ordre des étapes mis à jour.', 'success');
      },
      error: () => this.showMessage('Réordonnancement impossible.', 'error')
    });
  }

  moveDown(row: any): void {
    const idx = this.etapes.findIndex(x => x.id === row.id);
    if (idx < 0 || idx >= this.etapes.length - 1 || !this.planId) return;

    const ids = [...this.etapes.map(x => x.id)];
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];

    this.api.reorder(this.planId, ids).pipe(take(1)).subscribe({
      next: () => {
        this.reloadEtapes();
        this.showMessage('Ordre des étapes mis à jour.', 'success');
      },
      error: () => this.showMessage('Réordonnancement impossible.', 'error')
    });
  }
}
