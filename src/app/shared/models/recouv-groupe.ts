// src/app/shared/models/recouv-groupe.ts
import { RecouvGroupeMembre } from './recouv-groupe-membre';

export type GroupeType = 'MANUEL' | 'DYNAMIQUE';

export class RecouvGroupe {
  readonly id!: number;                 // readOnly
  membres?: RecouvGroupeMembre[];       // readOnly côté API (souvent nested)

  code!: string;                        // maxLength: 50
  nom!: string;                         // maxLength: 255
  description?: string | null;          // nullable
  actif?: boolean;                      // boolean
  priority?: number | null;             // int32 nullable

  type_groupe?: GroupeType;

  readonly created_at!: string;         // readOnly ISO date-time
  updated_at?: string;                  // souvent readOnly côté backend
  created_by?: number | null;           // souvent readOnly
  updated_by?: number | null;           // souvent readOnly
}

/**
 * Payload envoyé au backend.
 * On envoie uniquement les champs métiers attendus (whitelist).
 * -> évite d'envoyer id, created_at, membres, audit fields, etc.
 */
export type RecouvGroupeRequest = {
  code: string;
  nom: string;
  description?: string | null;
  actif?: boolean;
  priority?: number | null;
  type_groupe?: GroupeType;
};

export function toRecouvGroupeRequest(g: RecouvGroupe): RecouvGroupeRequest {
  return {
    code: g.code,
    nom: g.nom,
    description: g.description ?? null,
    actif: g.actif ?? true,
    priority: g.priority ?? 10,
    type_groupe: g.type_groupe ?? 'DYNAMIQUE',
  };
}
