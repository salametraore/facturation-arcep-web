
export interface RedevanceAGenererLigne {
  montant_ligne: number;   // "4000000.00"
  prix_unitaire: number;   // "4000000.00"
  produit: string;         // "Bloc 10 000 numéros géographiques"
  produit_id: number;      // 43
  quantite: number;        // 1
}


export interface RedevanceAGenerer {
  annee: number;                  // 2028
  client_id: number;              // 9
  commentaire: string;            // "Facturation annuelle automatique"
  direction_technique_id: number; // 1
  fiche_technique_id: number;     // 196
  montant_restant: string;        // "4500000.00"
  montant_total: string;          // "4500000.00"
  objet: string;                  // "Redevance annuelle de gestion "
  periode_debut: string;          // "2028-01-01"
  periode_fin: string;            // "2028-12-31"
  position_direction_id: number;  // 1
  prorata_valeur: number;         // "1.00"
  signataire: string;             // "REST"
  statut_suivant: string;         // "RD2"
  type_frais: string;             // "RD"

  lignes: RedevanceAGenererLigne[];

}


export interface ListeRedevancesResponse {
  message: string;
  resultat: RedevanceAGenerer[];
}

export interface GenererRedevanceRequest {
  annee?: number;
  categorie_produit?: number;
  client?: number;
  signataire?: string;

  redevances?: RedevanceAGenerer[];
}

export interface GenererRedevanceResponse {
  message: string;
  resultat: number;
}

