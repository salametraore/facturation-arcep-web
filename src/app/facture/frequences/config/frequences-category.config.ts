// src/app/features/facture/frequences/frequences-category.config.ts
import { Validators } from '@angular/forms';
import { CategoryId, CategoryRuleSet, FieldRule, V, H } from '../../../shared/models/frequences-category.types';

/**
 * Configuration par catégorie fonctionnelle
 * basée sur les nouveaux DTO :
 * - stations => FicheTechniqueStationRequest
 * - canaux   => FicheTechniqueCanalRequest
 */
export const CATEGORY_CONFIG: Record<CategoryId, CategoryRuleSet> = {

  /** 1) PMR (privé) */
  1: {
    stations: {
      type_station:        V(true),

      puissance:           V(true),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   H(),
      classe_largeur_bande:H(),

      nbre_tranche:        H(),

      type_bande_frequence: H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station:             H(),
      type_canal:               V(true),
      zone_couverture:          V(true),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz:        V(true),
      classe_largeur_bande:     H(),

      type_bande_frequence:     V(true),
    }
  },

  /** 2) Aéronautique */
  2: {
    stations: {
      type_station:        V(true),

      puissance:           H(),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   H(),
      classe_largeur_bande:H(),

      nbre_tranche:        H(),

      type_bande_frequence:H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station:             H(),
      type_canal:               H(),
      zone_couverture:          H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz:        H(),
      classe_largeur_bande:     H(),

      type_bande_frequence:     H(),
    }
  },

  /** 3) Mobiles ouverts au public */
  3: {
    stations: {
      type_station:        V(true),

      puissance:           H(),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   H(),
      classe_largeur_bande:H(),

      nbre_tranche:        H(),

      type_bande_frequence:H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station:             H(),
      type_canal:               V(true),
      zone_couverture:          V(true),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz:        V(true),
      classe_largeur_bande:     V(true),

      type_bande_frequence:     V(true),
    }
  },

  /** 4) Fixes */
  4: {
    stations: {
      type_station:        V(true),

      puissance:          V(true),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   H(),
      classe_largeur_bande:H(),

      nbre_tranche:        H(),

      type_bande_frequence:H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station:             V(true),
      type_canal:               V(true),
      zone_couverture:          V(true),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz:        V(true),
      classe_largeur_bande:     H(),

      type_bande_frequence:     V(true),
    }
  },

  /** 5) Radio/TV/MMDS */
  5: {
    stations: {
      type_station:        V(true),

      puissance:          V(true),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   V(true),
      classe_largeur_bande: H(),

      nbre_tranche:        V(true),

      type_bande_frequence:V(true),

      zone_couverture:     H(),
      localite:            V(true),
      caractere_radio:     V(true),
    },
    canaux: {
      type_station:             H(),
      type_canal:              H(),
      zone_couverture:         H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz:       H(),
      classe_largeur_bande:    H(),

      type_bande_frequence:     H(),
    }
  },

  /** 6) Satellite */
  6: {
    stations: {
      type_station:        V(true),

      puissance:           H(),
      classe_puissance:    H(),

      nombre_station:      V(false),

      debit_kbps:          V(false),
      classe_debit:        H(),

      largeur_bande_mhz:   V(false),
      classe_largeur_bande: H(),

      nbre_tranche:        H(),

      type_bande_frequence:H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station: H(),
      type_canal: H(),
      zone_couverture: H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz: H(),
      classe_largeur_bande: H(),

      type_bande_frequence: H(),
    }
  },

  /** 7) Amateur/Expérimental */
  7: {
    stations: {
      type_station:        V(true),

      puissance:           H(),
      classe_puissance:    H(),

      nombre_station:      V(true),

      debit_kbps:          H(),
      classe_debit:        H(),

      largeur_bande_mhz:   H(),
      classe_largeur_bande:H(),

      nbre_tranche:        H(),

      type_bande_frequence:H(),

      zone_couverture:     H(),
      localite:            H(),
      caractere_radio:     H(),
    },
    canaux: {
      type_station:             H(),
      type_canal:               H(),
      zone_couverture:          H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz:        H(),
      classe_largeur_bande:     H(),

      type_bande_frequence:     H(),
    }
  },
};

/** Helper validators */
export const requiredIf = (rule?: FieldRule) =>
  (rule?.required ? [Validators.required] : []);
