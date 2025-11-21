// src/app/shared/models/frequences-category.types.ts
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Règle pour un champ : visible / obligatoire
 */
export interface FieldRule {
  visible: boolean;
  required?: boolean;
}

/**
 * Règles pour une station d'équipement
 * (basées sur StationEquipementRequest)
 */
export interface StationEquipementRuleSet {
  type_station:         FieldRule;
  puissance:            FieldRule;
  puissance_unite:      FieldRule;
  nbre_station:         FieldRule;
  debit:                FieldRule;
  unite_debit:          FieldRule;
  largeur_bande:        FieldRule;
  largeur_bande_unite:  FieldRule;
  bande_frequence:      FieldRule;
  caractere_commercial: FieldRule;
  nbre_tranche:         FieldRule;
  localite:             FieldRule;
}

/**
 * Règles pour une station canal
 * (basées sur StationCanalRequest)
 */
export interface StationCanalRuleSet {
  type_station:         FieldRule;
  type_canal:           FieldRule;
  puissance:            FieldRule;
  puissance_unite:      FieldRule;
  nbre_station:         FieldRule;
  debit:                FieldRule;
  unite_debit:          FieldRule;
  largeur_bande:        FieldRule;
  largeur_bande_unite:  FieldRule;
  bande_frequence:      FieldRule;
  caractere_commercial: FieldRule;
  nbre_tranche:         FieldRule;
  zone_couverture:      FieldRule;
  localite:             FieldRule;
}

/**
 * Config complète pour une catégorie
 */
export interface CategoryRuleSet {
  stations_equipement: StationEquipementRuleSet;
  stations_canal:      StationCanalRuleSet;
}

/** Helpers pour alléger la config */
export const V = (required = false): FieldRule => ({ visible: true, required });
export const H = (): FieldRule => ({ visible: false });
