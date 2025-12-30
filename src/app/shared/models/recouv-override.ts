// src/app/shared/models/recouv-override.ts

export type RecouvOverrideScopeEnum = 'CLIENT' | 'FACTURE' | 'AGENDA_ITEM';
export type RecouvOverrideTypeEnum = 'SUSPENDRE' | 'BLOQUER_RELANCE';

export class RecouvOverride {
  readonly id!: number;            // readOnly

  created_at?: string;             // ISO date-time
  updated_at?: string;             // ISO date-time

  scope!: RecouvOverrideScopeEnum; // required
  ref_id!: number;                 // int64 required

  type!: RecouvOverrideTypeEnum;   // required

  debut?: string | null;           // date-time nullable
  fin?: string | null;             // date-time nullable

  motif!: string;                  // required

  actif?: boolean;

  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut l'id (readOnly).
 * (Si ton backend refuse created_at/updated_at en écriture, enlève-les aussi.)
 */
export type RecouvOverrideRequest = Omit<RecouvOverride, 'id'>;

export function toRecouvOverrideRequest(x: RecouvOverride): RecouvOverrideRequest {
  const { id, ...payload } = x as any;
  return payload as RecouvOverrideRequest;
}
