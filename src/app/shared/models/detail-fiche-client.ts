export class DetailFicheClient {
  id_client: number;
  type_client: string;
  client: string;
  numero_compte_comptable?: string | null;
  email: string;
  telephone: string;
  nbre_factures?: number | null;
  nbre_factures_impayes?: number | null;
  total_facture?: number | null;
  total_du?: number | null;
  avance_du?: number | null;
}
