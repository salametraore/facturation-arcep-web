export class FicheTechniqueAFacturer {
  fiche_technique_id: number;
  client_id: number;
  client_nom: string;
  compte_comptable: string;
  categorie_produit_id: number;
  categorie_produit_libelle: string;
  type_frais_descrption: string;
  type_frais: string;
  objet?: string | null;
  signataire: string;
  liste_produits: ProduitFiche[];
  elt_recu: ElementRecu;
}

export interface ProduitFiche {
  produit_id: number;
  produit_nom: string;
  prix_unitaire: number;
  quantite: number;
  total: number;
}

export interface ElementRecu {
  id: number;
  fiche_technique: number;
  type_frais: string;
  statut: string;
}
