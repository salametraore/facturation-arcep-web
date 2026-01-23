// src/app/shared/models/frequences-category.types.ts
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Règle pour un champ : visible / obligatoire */
export interface FieldRule {
  visible: boolean;
  required?: boolean;
}

/**
 * Règles pour une station (FicheTechniqueStationRequest)
 */
export interface FicheTechniqueStationRuleSet {
  type_station: FieldRule;

  // puissance : tu as soit puissance soit classe_puissance (selon tes écrans)
  puissance: FieldRule;
  classe_puissance: FieldRule;

  // nombre_station (ancien nbre_station)
  nombre_station: FieldRule;

  // débit
  debit_kbps: FieldRule;
  classe_debit: FieldRule;

  // largeur bande
  largeur_bande_mhz: FieldRule;
  classe_largeur_bande: FieldRule;

  // tranche
  nbre_tranche: FieldRule;

  // bande fréquence
  type_bande_frequence: FieldRule;

  // divers
  zone_couverture: FieldRule;
  localite: FieldRule;
  caractere_radio: FieldRule;
}

/**
 * Règles pour un canal (FicheTechniqueCanalRequest)
 */
export interface FicheTechniqueCanalRuleSet {
  type_station: FieldRule;
  type_canal: FieldRule;
  nbre_canaux: FieldRule;

  zone_couverture: FieldRule;

  // tranche facturation
  nbre_tranche_facturation: FieldRule;

  // largeur bande
  largeur_bande_khz: FieldRule;
  classe_largeur_bande: FieldRule;

  // bande fréquence
  type_bande_frequence: FieldRule;

  // mode duplexage TDD ou FDD
  mode_duplexage: FieldRule;

  puissance_sortie : FieldRule;

}

/** Config complète pour une catégorie */
export interface CategoryRuleSet {
  stations: FicheTechniqueStationRuleSet;
  canaux: FicheTechniqueCanalRuleSet;
}

/** Helpers */
export const V = (required = false): FieldRule => ({ visible: true, required });
export const H = (): FieldRule => ({ visible: false });
