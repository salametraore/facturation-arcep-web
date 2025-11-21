export class CompteBilanLigne {
  numero: string;             // 706101
  libelle: string;            // "Compte"
  montant: number;            // 3_500_000
  montantEstime?: number | null;
  selectionne: boolean;       // case à cocher
}

export class CompteBilan {
  exercice: number;           // année comptable
  clientId: number;           // id du client
  lignes: CompteBilanLigne[];
}

export interface DocumentComptableImporte {
  id: number;
  nomFichier: string;        // balance_2023.xlsx
  ClientId: number;
  ClientNom: string;     // ONATEL S.A, Orange Burkina, ...
  anneeFiscale: number;      // 2023, 2022, ...
  dateImport: string;        // ISO string ou '2023-05-15'
}

export type StatutImport = 'NOUVEAU' | 'EXISTANT' | 'MODIFIE';

export interface CompteImport {
  idLigne: number;
  numero: string;          // 706101
  libelle: string;         // "Ventes de services"
  debit: number;           // montant débit dans le fichier
  credit: number;          // montant crédit dans le fichier
  statut: StatutImport;    // comparaison avec le plan comptable existant
  message?: string;        // ex : "Compte déjà existant"
  selectionne: boolean;    // à importer ?
}


export class ClientInfos {
  ClientId: number;
  ClientNom: string;
  anneeFiscale: number;
  typeOperateur: string;
}


export interface DocumentUtilise {
  id: number;
  type: string;        // "Balance", "Grand livre", ...
  nomFichier: string;
  urlTelechargement?: string;
  coche: boolean;
}

export interface LigneRetenue {
  numero: string;
  libelle: string;
  montantRetenu: number;
}

export interface RedevanceLigne {
  code: string;        // "FONCT", "DEV", "FONDS"
  nature: string;      // "Redevance de fonctionnement"
  baseTaxable: number; // chiffre d'affaire annuel
  taux: number;        // ex: 0.5 => 0,5 %
  montantDu: number;   // baseTaxable*taux
}


export interface ChiffreAffairePostaleCreateWithFileRequest {
  client: number;
  fiche_technique_id: number;
  fiche_technique_autorisation_id: number;
  anne_fiscale: number;
  date_emission: string;   // ISO string: '2025-11-21T00:00:00Z' par ex.
  nom: string;             // minLength = 1 géré côté formulaire
  fichier: File;           // correspond au $binary envoyé dans le FormData
}
