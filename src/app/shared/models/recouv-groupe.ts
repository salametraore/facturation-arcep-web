// src/app/shared/models/recouv-groupe.ts

import { RecouvGroupeMembre } from './recouv-groupe-membre';

export class RecouvGroupe {
  readonly id!: number;                 // readOnly

   membres?: RecouvGroupeMembre[];

  code!: string;                        // maxLength: 50
  nom!: string;                         // maxLength: 255

  description?: string | null;          // nullable
  actif?: boolean;                      // boolean
  priority?: number | null;             // int32 nullable

  readonly created_at!: string;         // readOnly ISO date-time
  updated_at?: string;                  // ISO date-time (souvent readOnly côté backend)

  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Payload POST/PUT/PATCH d'après ton swagger:
 * - code, nom obligatoires
 * - description, actif, priority optionnels
 * - updated_at, created_by, updated_by présents dans le request
 *
 * On exclut les champs readOnly: id, membres, created_at.
 * (Si ton backend refuse updated_at/created_by/updated_by en écriture, enlève-les aussi.)
 */
export type RecouvGroupeRequest =
  Omit<RecouvGroupe, 'id' | 'membres' | 'created_at'>;

export function toRecouvGroupeRequest(x: RecouvGroupe): RecouvGroupeRequest {
  const { id, membres, created_at, ...payload } = x as any;
  return payload as RecouvGroupeRequest;
}
