// src/app/shared/models/droits-utilisateur.ts

// ✅ On réutilise les modèles officiels
export * from './fonctionnalite.model';
export * from './operation.model';
export * from './role.model';

// ✅ Typages spécifiques à “droits utilisateur”
import { Role } from './role.model';

export interface UtilisateurRole {
  id: number;
  utilisateur: string;
  role: Role;           // ✅ objet (pas tableau)
  created_at: string;
  updated_at: string;
}

export interface RequestPostRole {
  id?: number;
  code?: string;
  libelle: string;
  liste_operations: number[];
}

export interface RequestPostUtilisateur {
  id?: number;
  username: string;
  last_name?: string;
  first_name?: string;
  telephone?: string | null;
  email?: string;
  direction?: number | null;
  password: string;
  liste_roles: number[];
}
