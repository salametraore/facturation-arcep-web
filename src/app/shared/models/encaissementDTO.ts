export class EncaissementDTO {
  id: number;
  id_client: number;
  type_client: string;
  client: string;
  email: string;
  telephone: string;
  encaissement_id: number;
  date_encaissement: string;
  montant_encaisse: number;
  montant_affecte: number;
  montant_restant: number;
  statut_affectation: string;
}
