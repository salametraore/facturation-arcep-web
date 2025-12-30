// src/app/shared/models/recouv-declencheur.ts

import { RecouvGroupe } from './recouv-groupe';
import { RecouvPlanAction } from './recouv-plan-action';

export type RecouvDeclencheurScopeEnum = 'TOUS' | 'MEMBRES_GROUPE';
export type TypeDelaiEnum = 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';

export class RecouvDeclencheur {
  readonly id!: number; // readOnly

  /** détails enrichis readOnly côté backend */
  readonly groupe_detail?: RecouvGroupe;
  readonly plan_action_detail?: RecouvPlanAction;

  created_at?: string; // ISO date-time
  updated_at?: string; // ISO date-time

  code!: string;       // maxLength: 80
  nom!: string;        // maxLength: 255
  description?: string | null;

  actif?: boolean;
  priority?: number | null; // int32

  scope?: RecouvDeclencheurScopeEnum;

  type_client?: string | null;           // maxLength: 1000
  type_produit_service?: string | null;  // maxLength: 1000

  montant_min?: string | null;           // decimal string nullable
  montant_max?: string | null;           // decimal string nullable

  nb_factures_impayees_min?: number | null;

  type_delai!: TypeDelaiEnum;            // required
  nb_jours!: number;                     // required

  created_by?: number | null;
  updated_by?: number | null;

  groupe!: number;       // FK required
  plan_action!: number;  // FK required
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut: id + *_detail (readOnly/enrichi).
 * (Si ton backend refuse created_at/updated_at en écriture, enlève-les aussi.)
 */
export type RecouvDeclencheurRequest =
  Omit<RecouvDeclencheur, 'id' | 'groupe_detail' | 'plan_action_detail'>;

export function toRecouvDeclencheurRequest(x: RecouvDeclencheur): RecouvDeclencheurRequest {
  const { id, groupe_detail, plan_action_detail, ...payload } = x as any;
  return payload as RecouvDeclencheurRequest;
}
