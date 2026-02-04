// src/app/features/facture/frequences/frequences-category.config.ts
import {Validators} from '@angular/forms';
import {CategoryId, CategoryRuleSet, FieldRule, H, V} from '../../../shared/models/frequences-category.types';

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
      type_station: V(true),

      puissance: V(false),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),
    },
    canaux: {
      type_station: H(),
      type_canal: V(true),
      nbre_canaux: V(true),
      zone_couverture: V(true),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz: V(true),
      classe_largeur_bande: H(),

      type_bande_frequence: V(true),

      mode_duplexage: H(),

      puissance_sortie: H(),

      classe_puissance_id: H(),

      caractere_radio: H(),
    }
  },

  /** 2) Aéronautique */
  2: {
    stations: {
      type_station: V(true),

      puissance: H(),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),
    },
    canaux: {
      type_station: H(),
      type_canal: H(),
      nbre_canaux: H(),
      zone_couverture: H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz: H(),
      classe_largeur_bande: H(),

      type_bande_frequence: H(),

      mode_duplexage: H(),

      puissance_sortie: H(),
      classe_puissance_id: H(),

      caractere_radio: H(),
    }
  },

  /** 3) Mobiles ouverts au public */
  3: {
    stations: {
      type_station: V(true),

      puissance: H(),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),
    },

    canaux: {
      type_station: V(true),
      type_canal: V(true),
      nbre_canaux: V(true),
      zone_couverture: V(false),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz: V(true),
      classe_largeur_bande: H(),

      type_bande_frequence: V(false),

      mode_duplexage: V(false),

      puissance_sortie: H(),
      classe_puissance_id: H(),

      caractere_radio: H(),

    }
  },

  /** 4) Fixes */
  4: {
    stations: {
      type_station: V(true),

      puissance: H(),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),


    },
    canaux: {
      type_station: V(true),
      type_canal: V(true),
      nbre_canaux: V(true),
      zone_couverture: V(false),

      puissance_sortie: V(false),
      classe_puissance_id: H(),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz: V(true),
      classe_largeur_bande: H(),

      type_bande_frequence: V(false),

      mode_duplexage: V(false),

      caractere_radio: H(),
    }
  },

  /** 5) Radio/TV/MMDS */
  5: {
    stations: {
      type_station: V(true),

      nombre_station: V(true),

      caractere_radio: V(true),

      localite: V(false),

      puissance: H(),
      classe_puissance: H(),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),

    },
    canaux: {
      type_station: V(true),
      type_canal: V(true),
      nbre_canaux: V(true),
      zone_couverture: V(false),

      puissance_sortie: V(false),
      classe_puissance_id: H(),

      nbre_tranche_facturation: V(true),

      largeur_bande_khz: V(false),
      classe_largeur_bande: H(),

      type_bande_frequence: V(false),
      mode_duplexage: H(),

      caractere_radio: V(true),
    }
  },

  /** 6) Satellite */
  6: {
    stations: {
      type_station: V(true),

      puissance: H(),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: V(false),
      classe_debit: H(),

      largeur_bande_mhz: V(false),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),
    },
    canaux: {
      type_station: H(),
      type_canal: H(),
      nbre_canaux: H(),
      zone_couverture: H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz: H(),
      classe_largeur_bande: H(),

      type_bande_frequence: H(),

      mode_duplexage: H(),

      puissance_sortie: H(),
      classe_puissance_id: H(),

      caractere_radio: H(),
    }
  },

  /** 7) Amateur/Expérimental */
  7: {
    stations: {
      type_station: V(true),

      puissance: H(),
      classe_puissance: H(),

      nombre_station: V(true),

      debit_kbps: H(),
      classe_debit: H(),

      largeur_bande_mhz: H(),
      classe_largeur_bande: H(),

      nbre_tranche: H(),

      type_bande_frequence: H(),

      zone_couverture: H(),
      localite: H(),
      caractere_radio: H(),
    },
    canaux: {
      type_station: H(),
      type_canal: H(),
      nbre_canaux: H(),
      zone_couverture: H(),

      puissance_sortie: H(),
      classe_puissance_id: H(),

      nbre_tranche_facturation: H(),

      largeur_bande_khz: H(),
      classe_largeur_bande: H(),

      type_bande_frequence: H(),

      mode_duplexage: H(),

      caractere_radio: H(),

    }
  },
};

/** Helper validators */
export const requiredIf = (rule?: FieldRule) =>
  (rule?.required ? [Validators.required] : []);
