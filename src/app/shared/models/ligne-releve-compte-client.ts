export class LigneReleveCompteClient {
  id: number;
  type_ligne: 'FACTURE' | '...' ; // Tu peux étendre avec d'autres types si nécessaire
  date_echeance: string; // Format ISO (YYYY-MM-DD)
  reference: string;
  montant: number;
}
