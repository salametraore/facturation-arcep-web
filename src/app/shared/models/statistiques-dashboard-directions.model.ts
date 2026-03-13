// src/app/shared/models/statistiques-dashboard-directions.model.ts

export interface FicheParStatut {
  statut_code: string;
  statut_libelle: string;
  nombre: number;
}

export interface DevisParEtat {
  etat: string;
  nombre: number;
  montant: number;
}

export interface DevisParClient {
  client__id: number;
  client__denomination_sociale: string;
  nombre: number;
  montant: number;
}

export interface FactureParEtat {
  etat: string;
  nombre: number;
  montant: number;
}

export interface FactureParClient {
  client__id: number;
  client__denomination_sociale: string;
  nombre: number;
  montant: number;
}

export interface StatistiquesDashboardDirections {
  nombre_fiches: number;

  nombre_devis: number;
  montant_devis: number;

  nombre_factures: number;
  montant_factures: number;

  nombre_produits: number;
  nombre_clients: number;

  fiches_par_statut: FicheParStatut[];

  devis_par_etat: DevisParEtat[];
  devis_par_client: DevisParClient[];

  factures_par_etat: FactureParEtat[];
  factures_par_client: FactureParClient[];
}
