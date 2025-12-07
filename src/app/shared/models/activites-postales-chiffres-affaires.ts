export class ChiffreAffairePostaleCreateWithFileRequest {
  client: number;
  annee_fiscale: number;
  date_chargement: string;   // ISO string: '2025-11-21T00:00:00Z' par ex.
  nom: string;             // minLength = 1 géré côté formulaire
  fichier: File;           // correspond au $binary envoyé dans le FormData
}


// Document associé au chiffre d’affaires postal
export interface DocumentCAP {
  id: number;               // readOnly
  fichier: string;          // par ex. URL ou nom de fichier
  nom?: string | null;
  created_at: string;       // ISO date-time
}

// Ligne de détail du chiffre d’affaires postal
export interface LigneChiffreAffairePostale {
  id: number;               // readOnly
  numero_compte: string;
  libelle_compte: string;
  montant: string;          // décimal au format string
  montant_estime?: number | null;
  taux?: number | null;
  retenu: boolean;
}

// Objet principal
export interface ChiffreAffairePostale {
  id: number;                               // readOnly

  client: number;                           // client_id
  fiche_technique?: number | null;
  fiche_technique_autorisation?: number | null;

  date_chargement: string;                  // ISO date-time

  taux_fonctionnement?: string | null;      // décimaux sous forme de string
  montant_fonctionnement?: string | null;

  taux_developpement?: string | null;
  montant_developpement?: string | null;

  taux_compensation?: string | null;
  montant_compensation?: string | null;

  chiffre_affaire?: string | null;

  documents: DocumentCAP[];                 // readOnly
  lignes: LigneChiffreAffairePostale[];     // readOnly
}
