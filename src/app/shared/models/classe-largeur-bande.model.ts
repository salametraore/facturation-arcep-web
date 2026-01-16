// src/app/shared/models/classe-largeur-bande.model.ts

export class ClasseLargeurBande {
  id: number;

  created_at?: string;  // ISO date-time
  updated_at?: string;  // ISO date-time

  code: string;         // maxLength: 50
  libelle: string;      // maxLength: 255

  lb_min_mhz?: number;  // decimal (jusqu'à 3 décimales)
  lb_max_mhz?: number;  // decimal (jusqu'à 3 décimales)

  actif: boolean;

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}

/**
 * Payload API pour create/update
 */
export class ClasseLargeurBandeRequest {
  created_at?: string;
  updated_at?: string;

  code: string;
  libelle: string;

  lb_min_mhz?: number;
  lb_max_mhz?: number;

  actif: boolean;

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}
