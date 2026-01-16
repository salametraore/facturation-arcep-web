// src/app/shared/models/utilisateur.model.ts

import { Role } from './role.model';

/** Pour coller à la regex DRF: ^[\w.@+-]+$ */
export type Username = string;

/** Réponse API: Utilisateur (avec roles_detail readOnly) */
export interface Utilisateur {
  /** readOnly */
  id: number;

  username: Username;

  last_name?: string;
  first_name?: string;

  telephone?: string | null;
  email?: string;

  direction?: number | null;

  /** readOnly */
  roles_detail: Role[];
}

/** Requête API: création / mise à jour (avec password + liste_roles writeOnly) */
export interface UtilisateurRequest {
  username: Username;

  last_name?: string;
  first_name?: string;

  telephone?: string | null;
  email?: string;

  direction?: number | null;

  /** writeOnly */
  password: string;

  /** writeOnly */
  liste_roles: number[];
}

/** Payload de mise à jour SANS password si ton endpoint PATCH/PUT ne l’exige pas */
export type UtilisateurUpdateRequest = Omit<UtilisateurRequest, 'password'> & {
  password?: string; // optionnel selon ton backend
};

/**
 * Helpers
 */

/** Convertit un Utilisateur (réponse) en payload d’update */
export function utilisateurToUpdateRequest(u: Utilisateur): UtilisateurUpdateRequest {
  return {
    username: u.username,
    last_name: u.last_name,          // garde undefined si absent
    first_name: u.first_name,        // garde undefined si absent
    telephone: u.telephone ?? null,  // null si non renseigné
    email: u.email,                  // garde undefined si absent
    direction: u.direction ?? null,
    liste_roles: (u.roles_detail ?? []).map(r => r.id),
  };
}



export interface UtilisateurRole {
  id: number;
  utilisateur: string;
  role: Role[];
  created_at: string;
  updated_at: string;
}
