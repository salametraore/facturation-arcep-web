// src/app/shared/models/recouv-agenda-item-facture.ts

export class RecouvAgendaItemFacture {
  readonly id!: number;        // readOnly

  created_at?: string;         // ISO date-time
  updated_at?: string;         // ISO date-time

  facture_id!: number;         // int64

  montant_restant?: string | null; // decimal string (nullable)
  date_echeance?: string | null;    // date (YYYY-MM-DD) nullable

  created_by?: number | null;
  updated_by?: number | null;

  agenda_item!: number;        // FK (required)
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut l'id (readOnly).
 * (Si ton backend refuse created_at/updated_at, exclue-les aussi.)
 */
export type RecouvAgendaItemFactureRequest =
  Omit<RecouvAgendaItemFacture, 'id'>;

export function toRecouvAgendaItemFactureRequest(
  x: RecouvAgendaItemFacture
): RecouvAgendaItemFactureRequest {
  const { id, ...payload } = x as any;
  return payload as RecouvAgendaItemFactureRequest;
}
