import { LignesFactures } from './lignesFactures';

export class Facture {
  id?: number;
  reference?:string;
  date_echeance?: Date;
  montant?: number;
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

export class GenererRedevanceRequest {
  annee?: number;
  categorie_produit?: number;
  client?: number;
  direction?: number;
  signataire?: string;
}


import { Client } from "./client";

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
}
