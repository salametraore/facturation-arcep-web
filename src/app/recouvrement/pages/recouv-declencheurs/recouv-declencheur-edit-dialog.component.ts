import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import {
  RecouvDeclencheur,
  RecouvDeclencheurRequest,
  TypeDelaiEnum,
  RecouvDeclencheurScopeEnum
} from '../../../shared/models/recouv-declencheur';

import {
  RcvDeclencheur as LegacyRcvDeclencheur,
  RcvTypeDelai as LegacyRcvTypeDelai,
  criteresToDelai
} from '../../models/rcv-declencheur.models';

import { RecouvDeclencheurServices } from '../../../shared/services/recouv-declencheur.services';
import { RecouvGroupeServices } from '../../../shared/services/recouv-groupe.services';
import { RecouvPlanActionServices } from '../../../shared/services/recouv-plan-action.services';
import { ProduitService } from '../../../shared/services/produits.service';
import { ClientService } from '../../../shared/services/client.service';

export type RecouvDeclencheurEditDialogRow = RecouvDeclencheur | LegacyRcvDeclencheur;

export type RecouvDeclencheurEditDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; row: RecouvDeclencheurEditDialogRow };

export type RcvDeclencheurEditDialogData = RecouvDeclencheurEditDialogData;

@Component({
  selector: 'recouv-declencheur-edit-dialog',
  templateUrl: './recouv-declencheur-edit-dialog.component.html',
  styleUrls: ['./recouv-declencheur-edit-dialog.component.scss'],
})
export class RecouvDeclencheurEditDialogComponent {
  typeClients: string[] = [];

  readonly typeDelais: { value: TypeDelaiEnum; label: string }[] = [
    { value: 'AVANT_ECHEANCE', label: 'Avant échéance' },
    { value: 'APRES_ECHEANCE', label: 'Après échéance' },
  ];

  readonly scopes: { value: RecouvDeclencheurScopeEnum; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: 'MEMBRES_GROUPE', label: 'Membres du groupe' },
  ];

  produits: Array<{ value: string; label: string }> = [];
  groupes: Array<{ id: number; label: string }> = [];
  plansActions: Array<{ id: number; label: string }> = [];

  loadingGroupes = false;
  loadingPlans = false;
  loadingProduits = false;
  loadingTypeClients = false;
  saving = false;

  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RecouvDeclencheurEditDialogData,
    private ref: MatDialogRef<RecouvDeclencheurEditDialogComponent>,
    private fb: FormBuilder,
    private declencheurService: RecouvDeclencheurServices,
    private recouvGroupeServices: RecouvGroupeServices,
    private recouvPlanActionServices: RecouvPlanActionServices,
    private produitService: ProduitService,
    private clientService: ClientService,
  ) {
    this.form = this.buildForm();

    this.loadGroupes();
    this.loadPlansActions();
    this.loadProduits();
    this.loadTypeClients();

    if (data.mode === 'edit') {
      this.patch(data.row);
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group(
      {
        code: ['', [Validators.required, Validators.maxLength(80)]],
        nom: ['', [Validators.required, Validators.maxLength(255)]],
        description: [''],
        actif: [true],
        priority: [null],
        scope: ['TOUS' as RecouvDeclencheurScopeEnum],

        groupe: [null, [Validators.required]],
        plan_action: [null, [Validators.required]],

        // UI = tableaux pour multi-select
        type_client: [[] as string[]],
        type_produit_service: [[] as string[]],

        montant_min: [null],
        montant_max: [null],
        nb_factures_impayees_min: [null],

        type_delai: ['APRES_ECHEANCE' as TypeDelaiEnum, [Validators.required]],
        nb_jours: [0, [Validators.required, Validators.min(0)]],
      },
      { validators: [this.minMaxValidator] }
    );
  }

  private loadGroupes(): void {
    this.loadingGroupes = true;

    this.recouvGroupeServices.getItems().pipe(take(1)).subscribe({
      next: (rows: any) => {
        const items = Array.isArray(rows) ? rows : (rows?.results ?? []);
        this.groupes = items
          .map((g: any) => ({
            id: Number(g.id),
            label: this.buildGroupeLabel(g),
          }))
          .filter((g: { id: number; label: string }) => !!g.id)
          .sort((a: { label: string }, b: { label: string }) =>
            a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' })
          );
      },
      error: (e: any) => {
        console.error('Chargement groupes impossible', e);
        this.groupes = [];
        alert('Chargement des groupes impossible');
      },
      complete: () => {
        this.loadingGroupes = false;
      }
    });
  }

  private loadPlansActions(): void {
    this.loadingPlans = true;

    this.recouvPlanActionServices.getItems().pipe(take(1)).subscribe({
      next: (rows: any) => {
        const items = Array.isArray(rows) ? rows : (rows?.results ?? []);
        this.plansActions = items
          .map((p: any) => ({
            id: Number(p.id),
            label: this.buildPlanActionLabel(p),
          }))
          .filter((p: { id: number; label: string }) => !!p.id)
          .sort((a: { label: string }, b: { label: string }) =>
            a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' })
          );
      },
      error: (e: any) => {
        console.error('Chargement plans d’action impossible', e);
        this.plansActions = [];
        alert('Chargement des plans d’action impossible');
      },
      complete: () => {
        this.loadingPlans = false;
      }
    });
  }

  private loadProduits(): void {
    this.loadingProduits = true;

    this.produitService.getListItems().pipe(take(1)).subscribe({
      next: (rows: any) => {
        const items = Array.isArray(rows) ? rows : (rows?.results ?? []);
        this.produits = items
          .map((p: any) => this.buildProduitOption(p))
          .filter((p: { value: string; label: string } | null): p is { value: string; label: string } => !!p)
          .sort((a: { label: string }, b: { label: string }) =>
            a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' })
          );
      },
      error: (e: any) => {
        console.error('Chargement produits impossible', e);
        this.produits = [];
        alert('Chargement des produits impossible');
      },
      complete: () => {
        this.loadingProduits = false;
      }
    });
  }

  private loadTypeClients(): void {
    this.loadingTypeClients = true;

    this.clientService.getItems().pipe(take(1)).subscribe({
      next: (rows: any) => {
        const items: any[] = Array.isArray(rows) ? rows : (rows?.results ?? []);

        const values: string[] = items
          .map((c: any): string | null => this.extractClientType(c))
          .filter((v: string | null): v is string => !!v);

        this.typeClients = [...new Set<string>(values)].sort((a: string, b: string) =>
          a.localeCompare(b, 'fr', { sensitivity: 'base' })
        );
      },
      error: (e: any) => {
        console.error('Chargement types client impossible', e);
        this.typeClients = [];
        alert('Chargement des types de client impossible');
      },
      complete: () => {
        this.loadingTypeClients = false;
      }
    });
  }

  private buildGroupeLabel(g: any): string {
    const code = String(g?.code ?? '').trim();
    const nom = String(
      g?.nom ??
        g?.label ??
          g?.libelle ??
            g?.intitule ??
              ''
    ).trim();

    if (code && nom) return `${code} - ${nom}`;
    if (nom) return nom;
    if (code) return code;
    return `Groupe #${g?.id}`;
  }

  private buildPlanActionLabel(p: any): string {
    const code = String(p?.code ?? '').trim();
    const nom = String(
      p?.nom ??
        p?.label ??
          p?.libelle ??
            p?.intitule ??
              ''
    ).trim();

    if (code && nom) return `${code} - ${nom}`;
    if (nom) return nom;
    if (code) return code;
    return `Plan #${p?.id}`;
  }

  private buildProduitOption(p: any): { value: string; label: string } | null {
    const code = String(
      p?.code ??
        p?.produit_code ??
          p?.reference ??
            ''
    ).trim();

    const nom = String(
      p?.nom ??
        p?.label ??
          p?.libelle ??
            p?.designation ??
              ''
    ).trim();

    if (!code) return null;

    return {
      value: code,
      label: nom ? `${code} - ${nom}` : code
    };
  }

  private extractClientType(c: any): string | null {
    const raw = c?.type_client
      ?? c?.typeClient
        ?? c?.type_de_client
          ?? c?.type
            ?? null;

    const value = String(raw ?? '').trim().toUpperCase();
    return value || null;
  }

  private splitCsv(value?: unknown): string[] {
    if (value === null || value === undefined || value === '') {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map(v => String(v ?? '').trim())
        .filter(Boolean);
    }

    const s = String(value).trim();
    if (!s) return [];

    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          return parsed
            .map(v => String(v ?? '').trim())
            .filter(Boolean);
        }
      } catch {
        // fallback simple split
      }
    }

    return s
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(Boolean);
  }

  private joinCsvStrings(values?: string[] | null): string | null {
    const cleaned = (values || [])
      .map(v => String(v ?? '').trim())
      .filter(Boolean);

    return cleaned.length ? cleaned.join(',') : null;
  }

  private toDecimalString(value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return String(value);
  }

  private isLegacyRow(row: RecouvDeclencheurEditDialogRow): row is LegacyRcvDeclencheur {
    return 'criteres' in row || 'groupe_id' in row || 'plan_action_id' in row;
  }

  private mapLegacyTypeDelai(value: LegacyRcvTypeDelai | null | undefined): TypeDelaiEnum {
    return value === 'AVANT' ? 'AVANT_ECHEANCE' : 'APRES_ECHEANCE';
  }

  private patch(row: RecouvDeclencheurEditDialogRow): void {
    if (this.isLegacyRow(row)) {
      const { typeDelai, nbJours } = criteresToDelai(row.criteres);

      this.form.patchValue({
        code: row.code,
        nom: row.nom,
        description: row.description ?? '',
        actif: row.actif ?? true,
        priority: null,
        scope: 'TOUS',

        groupe: row.groupe_id,
        plan_action: row.plan_action_id ?? null,

        type_client: row.criteres?.type_client ?? [],
        type_produit_service: row.criteres?.produit_code ?? [],

        montant_min: row.criteres?.montant_min ?? null,
        montant_max: row.criteres?.montant_max ?? null,
        nb_factures_impayees_min: row.criteres?.nb_factures_impayees_min ?? null,

        type_delai: this.mapLegacyTypeDelai(typeDelai),
        nb_jours: nbJours,
      });

      return;
    }

    this.form.patchValue({
      code: row.code,
      nom: row.nom,
      description: row.description ?? '',
      actif: row.actif ?? true,
      priority: row.priority ?? null,
      scope: row.scope ?? 'TOUS',

      groupe: row.groupe,
      plan_action: row.plan_action,

      type_client: this.splitCsv(row.type_client),
      type_produit_service: this.splitCsv(row.type_produit_service),

      montant_min: row.montant_min ?? null,
      montant_max: row.montant_max ?? null,
      nb_factures_impayees_min: row.nb_factures_impayees_min ?? null,

      type_delai: row.type_delai,
      nb_jours: row.nb_jours,
    });
  }

  close(): void {
    this.ref.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const v = this.form.value;

    const payload: RecouvDeclencheurRequest = {
      code: v.code,
      nom: v.nom,
      description: v.description ?? null,
      actif: !!v.actif,
      priority: v.priority ?? null,
      scope: v.scope ?? 'TOUS',

      groupe: Number(v.groupe),
      plan_action: Number(v.plan_action),

      type_client: this.joinCsvStrings(v.type_client),
      type_produit_service: this.joinCsvStrings(v.type_produit_service),

      montant_min: this.toDecimalString(v.montant_min),
      montant_max: this.toDecimalString(v.montant_max),
      nb_factures_impayees_min: v.nb_factures_impayees_min ?? null,

      type_delai: v.type_delai as TypeDelaiEnum,
      nb_jours: Number(v.nb_jours ?? 0),
    };

    const req$ = this.data.mode === 'create'
      ? this.declencheurService.create(payload)
      : this.declencheurService.update(this.data.row.id, payload);

    if (!req$ || typeof req$.subscribe !== 'function') {
      this.saving = false;
      console.error('req$ invalid', req$);
      alert('Erreur technique: requête invalide.');
      return;
    }

    req$.pipe(take(1)).subscribe({
      next: () => this.ref.close(true),
      error: (e: any) => {
        console.error(e);
        this.saving = false;
        alert('Enregistrement impossible');
      }
    });
  }

  private minMaxValidator(group: AbstractControl): ValidationErrors | null {
    const min = group.get('montant_min')?.value;
    const max = group.get('montant_max')?.value;

    if (min != null && max != null && min !== '' && max !== '' && Number(min) > Number(max)) {
      return { minMax: true };
    }

    return null;
  }
}
