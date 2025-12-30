// src/app/shared/models/recouv-promesse.ts

export type RecouvPromesseStatutEnum = 'EN_COURS' | 'RESPECTEE' | 'NON_RESPECTEE';

export class RecouvPromesse {
  readonly id!: number;            // readOnly

  created_at?: string;             // ISO date-time
  updated_at?: string;             // ISO date-time

  client_id!: number;              // int64 (required)
  facture_id?: number | null;      // int64 nullable

  montant!: string;                // decimal string ^-?\d{0,16}(?:\.\d{0,2})?$
  date_promesse!: string;          // date YYYY-MM-DD

  statut?: RecouvPromesseStatutEnum;

  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut l'id (readOnly).
 * (Si ton backend refuse created_at/updated_at en écriture, enlève-les aussi ici.)
 */
export type RecouvPromesseRequest = Omit<RecouvPromesse, 'id'>;

export function toRecouvPromesseRequest(x: RecouvPromesse): RecouvPromesseRequest {
  const { id, ...payload } = x as any;
  return payload as RecouvPromesseRequest;
}
