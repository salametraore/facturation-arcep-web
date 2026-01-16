// src/app/shared/models/tarif-redevance-gestion.model.ts

export interface TarifRedevanceGestion {
  id?: number;

  puissance_min?: number;
  puissance_max?: number;

  prix_unitaire: number;

  montant_min_reseau?: number;

  component_desc?: string;

  produit: number;
  zone?: number;

}

/**
 * Payload API pour create/update
 * (API attend des decimal sous forme string, mais on envoie souvent number et HttpClient sérialise ;
 * si ton backend exige absolument string, dis-moi et je te donne un mapper toApiDecimal().)
 */
export interface TarifRedevanceGestionRequest {
  puissance_min?: number;
  puissance_max?: number;

  prix_unitaire: number;

  montant_min_reseau?: number;

  component_desc?: string;

  produit: number;
  zone?: number;
}
