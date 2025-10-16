
export class Fonctionnalite {
  id: number;
  code: string;
  libelle: string;
}

export interface Operation {
  id: number;
  code: string;
  libelle: string;
  fonctionnalite: Fonctionnalite;
}

export interface Role {
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

