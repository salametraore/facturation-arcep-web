// src/app/shared/models/regle-tarif-frequence.model.ts

import {Produit} from "./produit";
import {CategorieProduit} from "./categorie-produit";
import {TypeStation} from "./type-station";
import {TypeCanal} from "./typeCanal";
import {ZoneCouverture} from "./zone-couverture";
import {TypeBandeFrequence} from "./typeBandeFrequenceDetail";
import {ClasseDebit} from "./classe-debit.model";
import { ClassePuissance} from "./classe-puissance.model";

/** Enums API */
export type ObjetEnum = 'STATION' | 'CANAL';

export type NatureFraisEnum = 'DOSSIER' | 'GESTION' | 'UTILISATION';

export type UniteFacturationEnum =
  | 'PAR_STATION'
  | 'PAR_CANAL'
  | 'PAR_TRANCHES'
  | 'PAR_MHZ'
  | 'PAR_RESEAU';

export type ScopePlafondEnum = 'DOSSIER' | 'NATURE' | 'PRODUIT';

/**
 * Détails (API renvoie des objets imbriqués "..._detail").
 * On garde volontairement une forme tolérante pour éviter de dupliquer tous les modèles.
 * Tu peux remplacer `any` par tes types réels si tu les as déjà.
 */
export interface RefDetail {
  id?: number;
  code?: string;
  libelle?: string;
  [key: string]: any;
}

export interface RegleTarifFrequence {
  id: number;

  // details (read-only côté API)
  //caractere_radio_detail?: RefDetail;
  classe_debit_detail?: ClasseDebit;
  classe_puissance_detail?: ClassePuissance;
  type_bande_frequence_detail?: TypeBandeFrequence;
  zone_couverture_detail?: ZoneCouverture;
  type_canal_detail?: TypeCanal;
  type_station_detail?: TypeStation;
  categorie_produit_detail?: CategorieProduit;
  produit_detail?: Produit;

  // FK obligatoires
  categorie_produit: number;
  produit: number;

  // audit
  created_at?: string; // date-time
  updated_at?: string; // date-time
  created_by?: number | null;
  updated_by?: number | null;

  // règles
  objet: ObjetEnum;
  nature_frais: NatureFraisEnum;
  unite_facturation: UniteFacturationEnum;

  nb_min?: number | null;
  nb_max?: number | null;

  montant_unitaire: number; // API: string($decimal) -> on map en number côté TS
  plafond_par_dossier?: number | null;
  montant_min_par_reseau?: number | null;

  coeff_simplex?: number | null;
  coeff_zone?: number | null;
  coeff_bande?: number | null;
  coeff_global?: number | null;

  commentaire?: string | null;

  priorite?: number | null; // int64
  actif: boolean;

  scope_plafond: ScopePlafondEnum;

  // critères optionnels
  type_station?: number | null;
  type_canal?: number | null;
  zone_couverture?: number | null;
  type_bande_frequence?: number | null;

  classe_puissance?: number | null;
  classe_debit?: number | null;
  caractere_radio?: number | null;
  classe_largeur_bande?: number | null;
}

/** Payload API pour create/update */
export interface RegleTarifFrequenceRequest {
  categorie_produit: number;
  produit: number;

  objet: ObjetEnum;
  nature_frais: NatureFraisEnum;
  unite_facturation: UniteFacturationEnum;

  nb_min?: number | null;
  nb_max?: number | null;

  montant_unitaire: number;
  plafond_par_dossier?: number | null;
  montant_min_par_reseau?: number | null;

  coeff_simplex?: number | null;
  coeff_zone?: number | null;
  coeff_bande?: number | null;
  coeff_global?: number | null;

  commentaire?: string | null;

  priorite?: number | null;
  actif: boolean;

  scope_plafond: ScopePlafondEnum;

  type_station?: number | null;
  type_canal?: number | null;
  zone_couverture?: number | null;
  type_bande_frequence?: number | null;

  classe_puissance?: number | null;
  classe_debit?: number | null;
  caractere_radio?: number | null;
  classe_largeur_bande?: number | null;


  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}
