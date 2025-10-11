export class Categorie {
  id: number;
  libelle: string | null;
  description: string | null;
  code: string | null;
  etat: string | null;
  entreprise_id?: number| null;
  created_at: Date | null;
  updated_at: Date | null;
}
