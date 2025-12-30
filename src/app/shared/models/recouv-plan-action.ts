// src/app/shared/models/recouv-plan-action.ts

import { RecouvPlanEtape } from './recouv-plan-etape';

export class RecouvPlanAction {
  readonly id!: number;            // readOnly

  /** readOnly: liste enrichie côté backend */
  readonly etapes?: RecouvPlanEtape[];

  created_at?: string;             // ISO date-time
  updated_at?: string;             // ISO date-time

  code!: string;                   // maxLength: 50
  nom!: string;                    // maxLength: 255

  actif?: boolean;

  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut id + etapes (readOnly/enrichi).
 * (Si ton backend refuse created_at/updated_at en écriture, enlève-les aussi.)
 */
export type RecouvPlanActionRequest = Omit<RecouvPlanAction, 'id' | 'etapes'>;

export function toRecouvPlanActionRequest(x: RecouvPlanAction): RecouvPlanActionRequest {
  const { id, etapes, ...payload } = x as any;
  return payload as RecouvPlanActionRequest;
}
