export type ResultatEnum = 'SUCCES' | 'ECHEC' | 'ANNULE';

export class RecouvActionLog {
  readonly id!: number;               // readOnly

  created_at?: string;                // ISO date-time (souvent readOnly côté backend)
  updated_at?: string;                // ISO date-time (souvent readOnly côté backend)

  readonly date_execution!: string;   // readOnly (ISO date-time)

  resultat!: ResultatEnum;            // required
  details?: string | null;            // nullable

  canal_response?: any | null;        // objet libre (JSON) nullable

  created_by?: number | null;
  updated_by?: number | null;

  agenda_item?: number | null;        // FK nullable
}

/**
 * Payload utilisé par POST/PUT/PATCH selon ton backend.
 * Ici on exclut l'id et le champ readOnly date_execution.
 * Si ton backend refuse aussi created_at/updated_at, tu peux les exclure aussi.
 */
export type RecouvActionLogRequest =
  Omit<RecouvActionLog, 'id' | 'date_execution'>;

export function toRecouvActionLogRequest(x: RecouvActionLog): RecouvActionLogRequest {
  const { id, date_execution, ...payload } = x as any;
  return payload as RecouvActionLogRequest;
}
