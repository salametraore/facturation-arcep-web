import {FactureEncaissement} from "./facture-encaissement";

export class Encaissement {
  id?: number;
  date_encaissement!: string;
  montant!: number;
  affecte: number = 0;
  penalites: number = 0;
  solde_non_affecte!: number;
  reference!: string;
  objet?: string;
  mode_paiement!: number;
  client!: number;
  affectations: FactureEncaissement[];
}
