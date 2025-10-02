

export class FicheTechniqueProduit {
  readonly id: number;
  produit: number;
  fiche_technique_id: number;
  readonly produit_libelle: string;
  designation?: string | null;
  quantite?: number | null;
  prix_unitaire?: number | null;
  total?: string | null;
}

export class FicheTechniquesProduitsNouveau {
    id?: number;
    produit?: number;
    produit_libelle?: string;
    designation?: string;
    quantite?: number | null;
    prix_unitaire?: number | null;
    total?: number | null;
}
