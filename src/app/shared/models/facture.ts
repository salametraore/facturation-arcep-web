import { LignesFactures } from './lignesFactures';

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
  date_reception?: Date;
  client_nom!: string;
  compte_comptable!: string;
  fiche_technique?: number;
  position_direction?: string;
  categorie_produit!: string;
  type_frais?: string;
  periode?: string;
}
