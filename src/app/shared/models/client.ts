export interface Client {
  readonly id: number;
  created_at?: string;
  updated_at?: string;
  adresse: string;
  telephone: string;
  type: string;
  ifu?: string | null;
  rccm: string;
  qualite?: string;
  email?: string;
  site_web?: string | null;
  google_maps?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  first_name?: string;
  last_name?: string;
  telephone_rep_legal?: string | null;
  email_rep_legal?: string | null;
  strategique?: boolean;
  mauvais_payeur?: boolean;
  litige?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  utilisateur?: number | null;
  denomination_sociale: string;
  compte_comptable?: string | null;
  compte_banque?: string | null;

}

