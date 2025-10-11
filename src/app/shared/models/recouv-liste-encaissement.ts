export class RecouvListeEncaissement {
  id_client?: number;
  type_client?: string;
  client?: string;
  email?: string | null;
  telephone?: string | null;
  encaissement_id?: number;
  date_encaissement?: string;
  montant_encaisse?: number;
  montant_affecte?: number;
  montant_restant?: number;
  statut_affectation?: string;
  mode_paiement:string;
}
