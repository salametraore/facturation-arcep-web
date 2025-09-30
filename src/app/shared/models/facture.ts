import { LignesFactures } from './lignesFactures';
import { EtatEnum } from './etatEnum';

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
}
