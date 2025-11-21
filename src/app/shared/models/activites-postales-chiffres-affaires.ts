export class ChiffreAffairePostaleCreateWithFileRequest {
  client: number;
  fiche_technique_id: number;
  fiche_technique_autorisation_id: number;
  anne_fiscale: number;
  date_emission: string;   // ISO string: '2025-11-21T00:00:00Z' par ex.
  nom: string;             // minLength = 1 géré côté formulaire
  fichier: File;           // correspond au $binary envoyé dans le FormData
}
