// src/app/shared/models/classe-puissance.model.ts

export class ClassePuissance {
  id: number;

  created_at?: string;   // ISO date-time
  updated_at?: string;   // ISO date-time

  code: string;
  libelle: string;

  p_min_w?: number;      // decimal (jusqu'à 3 décimales)
  p_max_w?: number;      // decimal (jusqu'à 3 décimales)

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}

/**
 * Payload API pour create/update
 */
export class ClassePuissanceRequest {
  created_at?: string;
  updated_at?: string;

  code: string;
  libelle: string;

  p_min_w?: number;
  p_max_w?: number;

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}
