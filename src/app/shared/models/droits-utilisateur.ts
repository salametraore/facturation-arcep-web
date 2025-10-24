
export class Fonctionnalite {
  id: number;
  code: string;
  libelle: string;
}

export class Operation {
  id: number;
  code: string;
  libelle: string;
  fonctionnalite: Fonctionnalite;
}

export class Role {
  id: number;
  code: string;
  libelle: string;
  operations: Operation[];
}

export interface UtilisateurRole {
  id: number;
  utilisateur: string;
  role: Role[];
  created_at: string;
  updated_at: string;
}

export interface RequestPostRole {
  id?: number;                 // optionnel, généré par le backend
  code?: string;               // code interne du rôle
  libelle: string;             // libellé du rôle (obligatoire)
  liste_operations: number[];  // liste des IDs d’opérations associées (obligatoire)
}


export class RequestPostUtilisateur {
  id?: number;               // optionnel, généré par le backend
  username: string;          // obligatoire
  last_name?: string;        // nom de famille
  first_name?: string;       // prénom
  telephone?: string;        // téléphone
  email?: string;            // adresse email
  direction?: number | null; // ID ou objet Direction selon ton backend
  password: string;          // obligatoire (writeOnly)
  liste_roles: number[];     // liste des rôles (writeOnly)
}

