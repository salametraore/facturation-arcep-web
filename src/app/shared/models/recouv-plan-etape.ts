// src/app/shared/models/recouv-plan-etape.ts

import { RecouvTemplate } from './recouv-template';

export type TypeActionEnum = 'EMAIL' | 'SMS' | 'COURRIER' | 'APPEL';
export type ModeExecutionEnum = 'AUTO' | 'SEMI_AUTO' | 'MANU';
export type TypeDelaiEnum = 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';

export class RecouvPlanEtape {
  readonly id!: number;                 // readOnly

  /** détail template (readOnly, enrichi côté backend) */
  readonly template_detail?: RecouvTemplate;

  created_at?: string;                  // ISO date-time
  updated_at?: string;                  // ISO date-time

  ordre!: number;                       // int32
  type_action!: TypeActionEnum;         // required
  mode_execution!: ModeExecutionEnum;   // required
  type_delai!: TypeDelaiEnum;           // required
  nb_jours!: number;                    // int32

  actif?: boolean;

  created_by?: number | null;
  updated_by?: number | null;

  plan_action!: number;                 // FK required
  template?: number | null;             // FK nullable (id template)
}

/**
 * Payload POST/PUT/PATCH (d'après RecouvPlanEtapeRequest).
 * On exclut: id + template_detail (enrichi/readOnly).
 * (Si ton backend considère created_at/updated_at readOnly, enlève-les aussi.)
 */
export type RecouvPlanEtapeRequest =
  Omit<RecouvPlanEtape, 'id' | 'template_detail'>;

export function toRecouvPlanEtapeRequest(x: RecouvPlanEtape): RecouvPlanEtapeRequest {
  const { id, template_detail, ...payload } = x as any;
  return payload as RecouvPlanEtapeRequest;
}
