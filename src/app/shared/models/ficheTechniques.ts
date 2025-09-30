import { FicheTechniqueDocument } from './ficheTechniqueDocument';
import { FicheTechniquesProduits } from './ficheTechniquesProduits';
import {StatutFicheTechnique} from "./statut-fiche-technique";


export class FicheTechniques {
    readonly id: number;
    client: number;
    readonly client_nom: string;
    direction: number;
    utilisateur?: number | null;
    produits?: Array<{ [key: string]: any; }>;
    readonly produits_detail: Array<FicheTechniquesProduits>;
    date_creation?: string;
    position?: number;
    categorie_produit?: number;
    statut?: StatutFicheTechnique;
    documents?: Array<string>;
    commentaire?: string;
    avis?: string;
    readonly documents_detail: Array<FicheTechniqueDocument>;
}

export class MiseAJourStatutFiche{
  fiche_technique?:number;
  statut?:number;
  nouveau_statut?:number;
}


export interface RequestGenererFacture{
  fiche_technique_id: number;
  commentaire: string;
  objet: string;
  signataire: string;
}
