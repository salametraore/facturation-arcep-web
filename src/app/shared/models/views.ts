export class VCommandeClient {
  nom?: string;
  reference_client?: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  reference?: string;
  date?: any;
  montant?: number;
  etat?: string;
  reduction?: number;
  solde?: number;
  id?: number;
  taxe?: number;
  boutique_id?: number| null;
}

export class VCommandeFournisseur {
  nom?: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  reference?: string;
  id?: number;
  date?: string;
  montant?: number;
  etat?: string;
  entreprise_id?: number| null;
}

export class VProduitConditionnement {
  produit_conditionnement_id: number;
  produit_id: number;
  produit_nom: string;
  conditionnement_id: number;
  conditionnement_nom: string;
  type: string;
  quantite_par_unite: number;
  quantite: number;
  prixachat: number;
  prixvente: number;
  entreprise_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export class VBoutiqueProduit {
  constructor(
    public boutique_produit_id: number,
    public boutique_id: number,
    public boutique_nom: string,
    public produit_conditionnement_id: number,
    public produit_id: number,
    public produit_nom: string,
    public conditionnement_id: number,
    public conditionnement_type: string,
    public conditionnement_libelle: string | null,
    public quantite_par_unite: number,
    public stock_boutique: number,
    public prix_vente_par_defaut: number | null,
    public prix_achat: number | null,
    public date_ajout: string,
    public date_modification: string
  ) {}
}

export class VFactureProforma {
  nom: string;
  telephone: string;
  adresse: string;
  email: string;
  reference_client: string;
  reference: string;
  date: string;
  montant: number;
  id: number;
  boutique_id: number;
}

