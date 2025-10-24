
export class FicheTechniqueProduit {
  readonly id: number;
  produit: number;
  fiche_technique_id: number;
  readonly produit_libelle: string;
  designation?: string | null;
  quantite?: number | null;
  prix_unitaire?: number | null;
  total?: string | null;
  marque?: string | null;
  modele?: string | null;
  plage_numero?: string | null;
}

export class FicheTechniquesProduits {
  readonly id: number;
  produit: number;
  fiche_technique_id: number;
  readonly produit_libelle: string;
  designation?: string | null;
  quantite?: number | null;
  prix_unitaire?: number | null;
  total?: string | null;
  marque?: string | null;
  modele?: string | null;
  plage_numero?: string | null;
}

