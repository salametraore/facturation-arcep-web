
export interface EncaissementDetail {
   id?: number;
  created_at?: string;
  updated_at?: string;
  date_encaissement: string;
  montant: number;
  affecte?: number;
  penalites?: number;
  solde_non_affecte: number;
  reference: string;
  objet?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  mode_paiement: number;
  client: number;
  affectations: Affectation[]
}

export interface Affectation {
  id?: number;
  date_affectation: Date;
  facture_id?: number;
  devis_id?: number;
  montant?: number;
  montant_affecte?: number;
}

