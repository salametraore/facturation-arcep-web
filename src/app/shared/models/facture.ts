import { LignesFactures } from './lignesFactures';

import { Client } from "./client";


export class Facture {
  id?: number;
  reference?:string;
  date_echeance?: Date;
  montant?: number;
  montant_restant?: number;
  etat?: string;
  objet?:string;
  client?: number;
  devis?: number | null;
  direction_technique?: number;
  position?:number;
  commentaire?:string;
  signataire?:string;
  lignes_facture?: Array<LignesFactures>;
  date_reception?: Date;
  client_nom!: string;
  compte_comptable!: string;
  fiche_technique?: number;
  position_direction?: string;
  categorie_produit!: string;
  type_frais?: string;
  periode?: string;
}

export class ClientFactureDevisImpayes {

  // identifiant de la ligne d’impayé
  id!: number;

  // client concerné
  client!: Client;

  // "FACTURE" ou "DEVIS" (ou autre code géré par le backend)
  type_ligne!: string; // ex: 'FACTURE' | 'DEVIS';

  // id technique de la facture/devis dans sa table d’origine
  ligne_id!: number;

  // éventuellement id d’un lien facture/devis si ton backend en a un
  facture_devis_id?: number | null;

  // infos de la pièce
  reference!: string;

  objet!: string;

  date_emission!: string;   // ISO string (ex: '2025-11-17')

  montant!: number;

  montant_restant!: number;
}

export type TypeLigne = 'FACTURE' | 'DEVIS';

export interface FacturePenalite {
  facture_id?: number;
  devis_id?: number;

  type_ligne: TypeLigne;

  reference: string;
  objet: string;

  date_emission: string;    // ← maintenant c’est la date d’émission

  montant: number;
  montant_restant: number;

  taux_penalite: number;      // % saisi par l’utilisateur
  montant_penalite: number;   // montant calculé
}


/** Ligne de pénalité pour une facture ou un devis */
export interface FacturePenaliteLigneRequest {
  /** 'FACTURE' ou 'DEVIS' */
  type_ligne: string;

  /** Id de la facture ou du devis (facture_id ou devis_id) */
  ligne_id: number;

  /** REFERENCE DE LA 'FACTURE' ou 'DEVIS' */
  reference: string;

  /** Montant restant dû sur la ligne (base de calcul des pénalités) */
  montant_restant: number;

  /** Taux de pénalité (en %, ou selon la convention backend) */
  taux_penalite: number;

  /** Montant de la pénalité calculée pour cette ligne */
  montant_penalite: number;
}

/** Payload d’appel API pour générer la facture de pénalités */
export interface FacturePenalitesRequest {
  /** Identifiant du client concerné */
  clientId: number;

  /** Total des pénalités sur l’ensemble des lignes */
  totalPenalites: number;

  /** Liste des lignes de pénalités */
  lignes: FacturePenaliteLigneRequest[];
}
