export class EncaissementDirectDTO {
  date_encaissement: Date;
  montant: number;
  affecte: number;
  penalites: number;
  solde_non_affecte: number;
  reference: string;
  objet: string;
  mode_paiement: number;
  client: number;
}

export class ProduitDetail {
  produit: number;
  produit_libelle: string;
  quantite: number;
  prix_unitaire: number;
  designation: string;
  total: number ;
  plage_numero: string;
  marque: string;
  modele: string;
  zone_couverture?: number;
}

export type ProduitDetailForPayload = Omit<ProduitDetail, 'zone_couverture'>;

/*export type ProduitDetailForPayload = ProduitDetail;*/

export class FicheTechniqueDirectDTO {
  client: number;
  direction: number;
  utilisateur: number;
  produits_detail: ProduitDetail[];
  date_creation: string;
  position: number;
  position_direction: number;
  categorie_produit: number;
  objet: string;
  commentaire: string;
}

export class EncaissementDirectFicheTechniqueRequest {
  encaissement: EncaissementDirectDTO;
  fiche_technique: FicheTechniqueDirectDTO;
}

