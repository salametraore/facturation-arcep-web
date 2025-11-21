// src/app/shared/models/frequences.types.ts

/** Enums / ranges */
export type PuissanceClasse = 'LEQ_5W' | 'GT_5W' | 'LEQ_500W' | 'GT_500W' | 'NA';
export type BandeFreq =
  | 'UHF' | 'VHF'
  | 'LEQ_2_3_GHZ' | 'GT_2_3_GHZ'
  | 'LEQ_3_GHZ' | 'GT_3_GHZ'
  | 'NA';
export type TypeUsage = 'COMMERCIALE' | 'NON_COMMERCIALE';
export type ModeDuplex = 'DUPLEX' | 'SIMPLEX';
export type DebitClasse = 'LEQ_128K' | 'B128K_1M' | 'B1M_2M' | 'GT_2M';

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** --------- FICHE TECHNIQUE (partie "fiche" du form) --------- */
export interface FicheTechniquesFrequences {
  id?: number;
  client: number | null;
  client_nom?: string | null;
  direction?: number | null;
  utilisateur?: number | null;
  date_creation?: string | null;
  position?: number | null;
  position_direction?: number | null;
  categorie_produit: CategoryId | null;
  statut?: any;                        // ou un type plus précis si tu en as un
  objet?: string | null;
  commentaire?: string | null;
  avis?: any;
  duree?: number | null;
  date_fin?: string | null;
  date_debut?: string | null;
  periode?: string | null;
}

/** --------- STATIONS (buildStationRow) --------- */
export interface FicheFrequencesStation {
  id?: number;
  fiche_technique?: number;       // utilisé dans buildStationRow
  categorie_produit_id?: number;  // utilisé dans buildStationRow

  type_station?: number | null;   // id de type de station
  puissance_classe?: PuissanceClasse | null;
  nbre_station?: number | null;
  debit_classe?: DebitClasse | null;
  largeur_bande_mhz?: number | null;
  bande_frequence?: BandeFreq | 'NA' | null;
  type_usage?: TypeUsage | null;
  nbre_tranche?: number | null;
  localite?: string | null;
}

/** --------- CANAUX (buildCanalRow) --------- */
export interface FicheFrequencesCanal {
  id?: number;
  fiche_technique?: number;
  categorie_produit_id?: number;

  type_station?: number | null;     // présent dans buildCanalRow
  type_canal?: 'EMISSION' | 'RECEPTION' | 'EMI_RECP' | string | null;
  zone_couverture?: string | null;
  nbre_tranche_facturation?: number | null;
  largeur_bande_khz?: number | null;
  bande_frequence?: BandeFreq | 'NA' | null;
  mode_duplex?: ModeDuplex | null;
}

/** --------- DTO complet échangé avec le backend --------- */
export interface FicheFrequencesDTO {
  fiche: FicheTechniquesFrequences;
  stations: FicheFrequencesStation[];
  canaux: FicheFrequencesCanal[];

  // si tu as un calcul de lignes tarifées renvoyé par l’API
  lignes_tarifees?: LigneTarifee[];
  recap_calcul?: CalculRecap;
}

/** Options de lecture/écriture du DTO (query params) */
export interface FicheDTOQueryOptions {
  withLines?: boolean;  // ajoute lignes_tarifees depuis la DB
  recalc?: boolean;     // force recalcul serveur avant retour
}

/** Ligne de résultat tarifaire (facultatif mais utile pour le step 4) */
export interface LigneTarifee {
  id?: number;
  type_ligne?: string;
  reference?: string;
  quantite?: number;
  prix_unitaire?: number;
  montant_total?: number;
  produit_libelle?: string;
}

/** Récap de calcul (optionnel) */
export interface CalculRecap {
  frais_dossier: number;
  redev_gc: number;
  redev_util: number;
  total: number;
  details: any[];
}
