// src/app/shared/models/tarif-frais-dossier.model.ts

export interface TarifFraisDossier {
  id: number;
  produit: number;

  quantite_min?: number;
  quantite_max?: number  ;

  prix_unitaire: number;
}

/**
 * Payload API pour create/update
 */
export interface TarifFraisDossierRequest {
  produit: number;

  quantite_min?: number;
  quantite_max?: number ;

  prix_unitaire: number;

  montant_max_par_dossier?:  number ;
  zone?: number ;
}
