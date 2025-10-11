export class LigneReleveCompteClient {
  id: number;
  type_ligne: 'FACTURE' | '...' ; // Tu peux étendre avec d'autres types si nécessaire
  date_echeance: string; // Format ISO (YYYY-MM-DD)
  reference: string;
  montant: number;
}
/**
 * "id": 9223372036854776000,
 *     "client_id": 2147483647,
 *     "client": "string",
 *     "type_ligne": "string",
 *     "date_echeance": "2025-10-04",
 *     "reference": "string",
 *     "montant_facture": 0,
 *     "montant_encaissement": 0
 */

export class ReleveCompteClient {
  id?: number;
  client_id?: number;
  client?: string;
  type_ligne?: string;
  date_echeance?: Date;
  reference?: string;
  montant_facture?: number;
  montant_encaissement?: number;
}
