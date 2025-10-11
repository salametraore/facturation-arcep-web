export class FactureEncaissement {
  id?: number;
  encaissement?: number;           // ID de l'encaissement (peut être omis lors de la création)
  facture?: number | null;         // ID de la facture liée
  devis?: number | null;           // ID du devis lié (optionnel)
  montant_affecte?: number;        // ex: 678247.90
  date_affectation?: Date;       // format "YYYY-MM-DD"
}
