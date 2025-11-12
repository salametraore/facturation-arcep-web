import {FicheTechniqueDocument} from './ficheTechniqueDocument';
import {StatutFicheTechnique} from "./statut-fiche-technique";
import {FicheTechniqueProduit} from "./ficheTechniquesProduits";

export class FicheTechniques {

  id?: number;
  client?: number;
  client_nom?: string;
  direction?: number;
  utilisateur?: number | null;
  produits?: Array<{ [key: string]: any; }>;
  produits_detail?: Array<FicheTechniqueProduit>;
  date_creation?: string;
  position?: number;
  position_direction?: number | null;
  categorie_produit?: number;
  statut?: StatutFicheTechnique | null;
  documents?: Array<string>;
  documents_detail?: Array<FicheTechniqueDocument>;
  objet?: string | null;
  commentaire?: string | null;
  avis?: any;
  duree?: number | null;
  date_fin?: string | null;
  date_debut?: string | null;
  periode?: string | null;


}

export class MiseAJourStatutFiche {
  fiche_technique?: number;
  statut?: number;
  nouveau_statut?: number;
}

export class RequestGenererFacture {
  fiche_technique_id?: number;
  commentaire?: string;
  objet?: string;
  signataire?: string;
}

export class AvisEtudeTechnique {
  fiche_technique?: number | null;
  avis?: string;
  date_debut?: Date | null;
  duree?: number | null;
  nouveau_statut?: number | null;
}

export class RetraitAutorisationRequest {
  fiche_technique?: number | null;
  date_retrait?: Date | null;
  motif_retrait?: string;
}


export class ChercheFiche{
  categorie_produit?: number;
  client?: number;
  direction?: number;
  statut?: number;
  date_debut?: string;
  date_fin?: string;
}

export function buildProduitsLibelles(fiche: FicheTechniques | null | undefined): string {
  if (!fiche || !fiche.produits_detail || fiche.produits_detail.length === 0) {
    return '';
  }

  return fiche.produits_detail
    .map(p => p.produit_libelle)
    .filter((lib): lib is string => !!lib && lib.trim().length > 0)
    .join(', ');
}
