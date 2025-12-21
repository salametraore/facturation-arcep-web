// src/app/recouvrement/rcv-promesses/data/rcv-promesse.model.ts

export type RcvPromesseStatut = 'EN_COURS' | 'RESPECTEE' | 'NON_RESPECTEE';

export interface RcvPromesse {
  id: number;
  client_id: number;
  facture_id: number | null;     // null => promesse globale
  montant: number;
  date_promesse: string;         // YYYY-MM-DD
  statut: RcvPromesseStatut;
  created_at?: string;           // optionnel dans ton seed
}
