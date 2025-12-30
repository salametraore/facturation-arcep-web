// src/app/shared/models/recouv-agenda-item.ts

import { RecouvActionLog } from './recouv-action-log';
import {RecouvAgendaItemFacture} from "./recouv-agenda-item-facture";

/** Enum backend */
export type TypeActionEnum = 'EMAIL' | 'SMS' | 'COURRIER' | 'APPEL';
export type ModeExecutionEnum = 'AUTO' | 'SEMI_AUTO' | 'MANU';
export type RecouvAgendaItemStatutEnum =
  'A_FAIRE' | 'EN_COURS' | 'FAIT' | 'ECHOUE' | 'REPORTE' | 'ANNULE';



export class RecouvAgendaItem {
  readonly id!: number; // readOnly

  /** readOnly (listes enrichies côté backend) */
  readonly factures?: RecouvAgendaItemFacture[];
  readonly logs?: RecouvActionLog[];

  created_at?: string; // ISO date-time
  updated_at?: string; // ISO date-time

  client_id!: number; // int64

  nb_factures?: number;
  montant_total_restant?: string; // decimal string: ^-?\d{0,16}(?:\.\d{0,2})?$
  date_echeance_min?: string | null; // date (YYYY-MM-DD)

  type_action!: TypeActionEnum;
  mode_execution!: ModeExecutionEnum;

  date_planifiee!: string; // ISO date-time

  statut?: RecouvAgendaItemStatutEnum;

  agent_id?: number | null; // int64 nullable
  priorite?: number | null;

  template_snapshot?: any | null; // JSON nullable

  created_by?: number | null;
  updated_by?: number | null;

  groupe!: number;
  declencheur!: number;
  plan_action!: number;
  plan_etape!: number;
}

/**
 * Payload POST/PUT/PATCH.
 * On exclut: id + champs enrichis readOnly (factures/logs).
 * (Si ton backend refuse aussi created_at/updated_at, tu peux les exclure ici.)
 */
export type RecouvAgendaItemRequest =
  Omit<RecouvAgendaItem, 'id' | 'factures' | 'logs'>;

export function toRecouvAgendaItemRequest(x: RecouvAgendaItem): RecouvAgendaItemRequest {
  const { id, factures, logs, ...payload } = x as any;
  return payload as RecouvAgendaItemRequest;
}
