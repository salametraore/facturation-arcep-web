// devis.model.ts

import { Client } from './client';
import { LigneDevis } from './ligneDevis';
import { ETATS_DEVIS, TYPE_FRAIS } from '../../constantes'; // valeurs

// 🔧 [FIX TYPES] On dérive les types à partir des constantes
type EtatDevis = (typeof ETATS_DEVIS)[keyof typeof ETATS_DEVIS];
type TypeFrais = (typeof TYPE_FRAIS)[keyof typeof TYPE_FRAIS];

export class Devis {
  id: number;                       // *
  reference: string;                // *
  objet: string;                    // *
  commentaire?: string;             // optionnel
  date_echeance?: string;           // optionnel (string ou Date selon ton API)
  date_reception?: string;          // optionnel
  montant: number;                  // *

  // 🔧 [FIX TYPES] utilisation des alias de type
  etat: EtatDevis;                  // au lieu de: ETATS_DEVIS

  client: Client;                   // *
  client_nom: string;               // *
  compte_comptable: string;         // *
  direction_technique: number;      // * (ou un type DirectionTechnique)
  fiche_technique?: any;            // à typer si tu as un modèle FicheTechnique
  lignes_devis: LigneDevis[];       // *
  position_direction?: number;      // optionnel
  position?: number;                // optionnel
  categorie_produit: number;        // *

  // 🔧 [FIX TYPES] idem ici
  type_frais?: TypeFrais;           // au lieu de: TYPE_FRAIS

  periode?: string;                 // optionnel
  signataire?: string;              // optionnel (ou un objet Utilisateur)
  annee?: number;                   // optionnel
  periode_debut?: string;           // optionnel
  periode_fin?: string;             // optionnel
  prorata_valeur?: number;          // optionnel
}

export class GenererFactureFromDevisResponse {
  facture_id!: number;     // id de la facture générée
  devis!: number;          // id du devis (ou change le type si tu renvoies un objet Devis)
  total!: number;          // montant total
  nombre_lignes!: number;  // nombre de lignes de facture
}
