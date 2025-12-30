// src/app/shared/models/recouv-groupe-membre.ts

export class RecouvGroupeMembre {
  readonly id!: number;        // readOnly

  created_at?: string;         // ISO date-time
  updated_at?: string;         // ISO date-time

  client_id!: number;          // int64 (required)

  exclu?: boolean;             // boolean
  motif_override?: string | null; // nullable

  created_by?: number | null;
  updated_by?: number | null;

  groupe!: number;             // FK (required)
}

export type RecouvGroupeMembreRequest = Omit<RecouvGroupeMembre, 'id'>;

export function toRecouvGroupeMembreRequest(x: RecouvGroupeMembre): RecouvGroupeMembreRequest {
  const { id, ...payload } = x as any;
  return payload as RecouvGroupeMembreRequest;
}
