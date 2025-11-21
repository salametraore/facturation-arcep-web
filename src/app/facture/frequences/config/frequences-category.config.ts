// src/app/features/facture/frequences/frequences-category.config.ts

import { Validators } from '@angular/forms';
import { CategoryId } from '../../../shared/models/frequences-category.types';

/*
1 : PMR (privé)
2 : Aéronautique
3 : Mobiles ouverts au public
4 : Fixes
5 : Radio/TV/MMDS
6 : Satellite
7 : Amateur/Expérimental
 */

/** Règle de visibilité / obligation pour un champ */
export interface FieldRule {
  visible: boolean;
  required?: boolean;
}

/**
 * Règles pour les stations "équipement"
 * -> mappe sur StationEquipementRequest
 */
export interface StationRuleSet {
  type_station:         FieldRule;
  puissance:            FieldRule;
  nbre_station:         FieldRule;
  debit:                FieldRule;
  largeur_bande:        FieldRule;
  largeur_bande_unite:  FieldRule;
  bande_frequence:      FieldRule;
  caractere_commercial: FieldRule;
  nbre_tranche:         FieldRule;
  localite:             FieldRule;
}

/**
 * Règles pour les stations "canal"
 * -> mappe sur StationCanalRequest
 */
export interface CanalRuleSet {
  type_station:         FieldRule;
  type_canal:           FieldRule;
  zone_couverture:      FieldRule;
  nbre_tranche:         FieldRule;
  largeur_bande:        FieldRule;
  largeur_bande_unite:  FieldRule;
  bande_frequence:      FieldRule;
}

/**
 * Config complète pour une catégorie
 * - stations  => stations_equipement
 * - canaux    => stations_canal
 */
export interface CategoryConfig {
  stations: StationRuleSet;
  canaux:   CanalRuleSet;
}

/** Raccourcis */
const V = (required = false): FieldRule => ({ visible: true, required });
const H = (): FieldRule => ({ visible: false });

/**
 * Configuration par catégorie fonctionnelle
 * (les commentaires rappellent l’ancien mapping quand nécessaire)
 */
export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  /** a) PMR privé (1) */
  1: {
    stations: {
      type_station:         V(true),
      puissance:            V(true),   // ex-puissance_classe
      nbre_station:         V(true),
      debit:                H(),       // pas utilisé ici
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      V(true),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         H(),
      type_canal:           V(true),
      zone_couverture:      V(true),
      nbre_tranche:         V(true),   // ex-nbre_tranche_facturation
      largeur_bande:        V(true),   // ex-largeur_bande_khz
      largeur_bande_unite:  V(true),
      bande_frequence:      V(true),   // UHF/VHF
    }
  },

  /** b) Aéronautique (2) */
  2: {
    stations: {
      type_station:         V(true),
      puissance:            H(),
      nbre_station:         V(true),
      debit:                H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         H(),
      type_canal:           H(),
      zone_couverture:      H(),
      nbre_tranche:         H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
    }
  },

  /** c) Mobiles ouverts au public (3) */
  3: {
    stations: {
      type_station:         V(true),
      puissance:            H(),
      nbre_station:         V(true),
      debit:                H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         H(),
      type_canal:           V(true),
      zone_couverture:      V(true),
      nbre_tranche:         V(true),
      largeur_bande:        V(true),
      largeur_bande_unite:  V(true),
      bande_frequence:      V(true),   // <=2.3GHz / >2.3GHz
    }
  },

  /** d) Fixes (4) */
  4: {
    stations: {
      type_station:         V(true),
      puissance:            V(true),
      nbre_station:         V(true),
      debit:                H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         V(true),   // requis pour lier canal à un type de station
      type_canal:           V(true),
      zone_couverture:      V(true),
      nbre_tranche:         V(true),
      largeur_bande:        V(true),
      largeur_bande_unite:  V(true),
      bande_frequence:      V(true),   // <=3GHz, >3GHz
    }
  },

  /** e) Radio/TV/MMDS (5) */
  5: {
    stations: {
      type_station:         V(true),
      puissance:            V(true),   // <=500W/>500W
      nbre_station:         V(true),
      debit:                H(),
      largeur_bande:        V(true),   // largeur d'une bande d'une tranche
      largeur_bande_unite:  V(true),
      bande_frequence:      V(true),
      caractere_commercial: V(true),   // remplace l’ancien type_usage
      nbre_tranche:         V(true),
      localite:             V(true),
    },
    canaux: {
      type_station:         H(),
      type_canal:           V(true),
      zone_couverture:      V(true),
      nbre_tranche:         V(true),
      largeur_bande:        V(true),
      largeur_bande_unite:  V(true),
      bande_frequence:      V(true),
    }
  },

  /** f) Satellite (6) */
  6: {
    stations: {
      type_station:         V(true),
      puissance:            H(),
      nbre_station:         V(true),   // portable/transportable
      debit:                V(true),   // ex-debit_classe (VSAT/DAMA)
      largeur_bande:        V(true),   // ex-largeur_bande_mhz
      largeur_bande_unite:  V(true),
      bande_frequence:      H(),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         V(true),
      type_canal:           V(true),
      zone_couverture:      V(true),
      nbre_tranche:         V(true),
      largeur_bande:        V(true),
      largeur_bande_unite:  V(true),
      bande_frequence:      H(),
    }
  },

  /** g) Amateur/Expérimental (7) */
  7: {
    stations: {
      type_station:         V(true),
      puissance:            H(),
      nbre_station:         V(true),
      debit:                H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
      caractere_commercial: H(),
      nbre_tranche:         H(),
      localite:             H(),
    },
    canaux: {
      type_station:         H(),
      type_canal:           H(),
      zone_couverture:      H(),
      nbre_tranche:         H(),
      largeur_bande:        H(),
      largeur_bande_unite:  H(),
      bande_frequence:      H(),
    }
  },
};

/** Helper pour ajouter Validators.required selon la règle */
export const requiredIf = (rule?: FieldRule) =>
  (rule?.required ? [Validators.required] : []);
