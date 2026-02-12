// fiche-technique-frequence-create-request.ts

import {StatutFicheTechnique} from "./statut-fiche-technique";

export interface FicheTechniqueCanalRequest {
  categorie_produit: number;

  type_canal?: number;
  nbre_canaux?: number;
  type_station?: number;

  zone_couverture?: number;

  nbre_tranche_facturation?: number;

  classe_largeur_bande?: number;
  largeur_bande_khz?: string;

  type_bande_frequence?: number;

  mode_duplexage?: string;

  puissance_sortie: number;

  classe_puissance_id: number;

  caractere_radio?: number;

  designation?: string;
}


export interface FicheTechniqueStationRequest {

  categorie_produit: number;
  type_station?: number;

  sous_type_station: number;

  puissance?: number;
  classe_puissance?: number;

  nombre_station?: number;

  zone_couverture?: number;
  localite?: string;

  nbre_tranche?: number;

  largeur_bande_mhz?: string;

  type_bande_frequence?: number;
  classe_largeur_bande?: number;

  debit_kbps?: number;
  classe_debit?: number;

  caractere_radio?: number;

  designation?: string;
}

export interface FicheTechniqueFrequenceCreateRequest {
  client: number;
  direction: number;
  utilisateur: number;

  date_creation?: string;

  position?: number;
  position_direction?: number;

  categorie_produit: number;

  objet?: string;
  commentaire?: string;

  avis?: 'FAV' | 'DEF' | string;

  duree?: number;

  date_fin?: string;
  date_debut?: string;

  periode?: string;

  date_avis?: string;

  canaux?: FicheTechniqueCanalRequest[];
  stations?: FicheTechniqueStationRequest[];
}


export interface FicheTechniqueFrequenceDetail {
  id: number;
  client: number;
  client_nom: string;

  direction: number;
  utilisateur: number;

  date_creation?: string;

  position?: number;
  position_direction?: number;

  categorie_produit: number;

  statut: StatutFicheTechnique;
  objet?: string;
  commentaire?: string;

  avis?: 'FAV' | 'DEF' | string;

  duree?: number;

  date_fin?: string;
  date_debut?: string;

  periode?: string;

  date_avis?: string;

  canaux?: FicheTechniqueCanalDetail[];
  stations?: FicheTechniqueStationDetail[];
}


export interface FicheTechniqueCanalDetail {
  id: number;

  categorie_produit: number;

  type_station: number;


  type_canal: number;
  nbre_canaux?: number;

  zone_couverture: number;

  nbre_tranche_facturation: number;

  largeur_bande_khz: string;
  classe_largeur_bande?: number;

  type_bande_frequence: number;

  mode_duplexage?: string;

  puissance_sortie: number;

  classe_puissance_id: number;

  caractere_radio?: number;

  designation?: string;
}


export interface FicheTechniqueStationDetail {
  id: number;

  categorie_produit: number;

  type_station?: number;

  sous_type_station: number;

  puissance?: number;
  classe_puissance?: number;

  nombre_station?: number;

  zone_couverture?: number;
  localite?: string;

  nbre_tranche?: number;

  largeur_bande_mhz?: string;

  type_bande_frequence?: number;
  classe_largeur_bande?: number;

  debit_kbps?: number;
  classe_debit?: number;

  caractere_radio?: number;

  designation?: string;

  created_at: string; // ISO date-time
  updated_at: string; // ISO date-time
}

export class CalculFraisFrequenceRequest {
  fiche_id: number;
  enregistrer: Boolean;
}


export interface ProduitDetail {
  id: number;
  code: string;
  libelle: string;
}

/*export type NatureFraisFrequence = 'DOSSIER' | 'UTILISATION' | string;*/

export interface CalculFraisFrequenceDetail {
  id: number | null;

  fiche_technique: number;

  // selon le type de ligne, l’un des 2 peut être présent
  station_id?: number;
  canal_id?: number;

  nature_frais: string;

  produit: ProduitDetail;

  regle_tarif_frequence: number;

  base_quantite: string;        // "5.0000"
  montant_unitaire: string;     // "20000.00"
  coefficient_global: string;   // "1.0000"
  montant_calcule: string;      // "100000.00"

  montant_plafond: number;

  reduction_applique: boolean;
  taux_reduction: number;
  montant_apres_reduction: number;

  created_at: string;           // ISO datetime
}

export interface CalculFraisFrequenceResult {
  fiche_id: number;
  total: string;
  nb_lignes: number;

  details: CalculFraisFrequenceDetail[];
}
