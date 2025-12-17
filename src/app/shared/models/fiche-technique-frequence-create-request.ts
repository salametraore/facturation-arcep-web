// fiche-technique-frequence-create-request.ts

import {StatutFicheTechnique} from "./statut-fiche-technique";

export interface FicheTechniqueCanalRequest {
  categorie_produit: number;

  type_canal?: number;
  type_station?: number;

  zone_couverture?: number;

  nbre_tranche_facturation?: number;

  classe_largeur_bande?: number;
  largeur_bande_khz?: string;

  type_bande_frequence?: number;


}



export interface FicheTechniqueStationRequest {

  categorie_produit: number;
  type_station?: number;

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
  id : number;
  client: number;
  client_nom : string;

  direction: number;
  utilisateur: number;

  date_creation?: string;

  position?: number;
  position_direction?: number;

  categorie_produit: number;

  statut : StatutFicheTechnique;
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

  zone_couverture: number;

  nbre_tranche_facturation: number;

  largeur_bande_khz: string;

  type_bande_frequence: number;
}


export interface FicheTechniqueStationDetail {
  id: number;

  categorie_produit: number;

  type_station: number;

  classe_puissance: number;

  nombre_station: number;
  debit_kbps: number;

  largeur_bande_mhz: string;

  type_bande_frequence: number;

  nbre_tranche: number;

  localite: string;

  zone_couverture: number;

  caractere_radio: number;

  created_at: string; // ISO date-time
  updated_at: string; // ISO date-time
}

export class  CalculFraisFrequenceRequest
{
  fiche_id: number;
  enregistrer: Boolean;
}
