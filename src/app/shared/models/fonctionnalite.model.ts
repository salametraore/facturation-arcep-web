// src/app/shared/models/fonctionnalite.model.ts
export interface Fonctionnalite {
  id: number;
  code?: string;
  libelle: string;
}

export interface FonctionnaliteRequest {
  code?: string;      // maxLength: 20
  libelle: string;    // maxLength: 200
}
