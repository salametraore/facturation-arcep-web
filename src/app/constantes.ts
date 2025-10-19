import {formatDate} from '@angular/common';

export const operations = {
  create: 'CREATE',
  details: 'details',
  update: 'UPDATE',
  transmettre: 'TRANSMETTRE',
  delete: 'DELETE',
  validate: 'VALIDATE',
  update_pwd: 'update_pwd',
  table: 'Table',
};

export const bouton_names = {
  add: 'Ajouter',
  details: 'Détails',
  modifier: 'Modifier',
  delete: 'Supprimer',
  yes: 'Oui',
  no: 'Non',
  cancel: 'Annuler',
  close: 'Quiter',
  validate: 'Valider',
  invalidate: 'Invalider',
  save: 'Enregistrer',
  actualise: 'Actualiser',
};

export const windows_titles = {
  windows_add: 'Ajout ',
  windows_update: 'Modification ',
  windows_update_pwd: 'Modification du mot de passe ',
  windows_delete: 'Suppression ',
  windows_detail: 'Détail '
};


export function format_date_for_url(text: any) {
  let tex = text.replace('/', '-');
  return tex.replace('/', '-');
}

export function date_converte(date?: any) {
  if (!date)  return undefined;

  let date_formart = formatDate(date, 'yyyy-MM-dd', 'fr');
  return format_date_for_url(date_formart);
}

export function convertToDatabaseFormat(dateString: string): string {
  // Convertir la chaîne de caractères en objet Date
  const date = new Date(dateString);

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide');
  }

  // Formater la date sous le format 'YYYY-MM-DD HH:mm:ss'
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ajouter un zéro si nécessaire
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day}`;
}

export function convertToFormatFr(dateString: string): string {
  // Convertir la chaîne de caractères en objet Date
  const date = new Date(dateString);

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide');
  }

  // Formater la date sous le format 'YYYY-MM-DD HH:mm:ss'
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ajouter un zéro si nécessaire
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${day}-${month}-${year}`;
}

export function date_formatDDMMYYYY(date: Date) {
  return formatDate(date, 'dd/MM/yyyy', 'fr');
}

export const ROLES = {
  admin: 'admin',
  gestionnaire: 'gestionnaire',
  user: 'user',
};

export const ROLES_LIST: Libelle[] =
  [
    {code: 'admin', libelle: 'Admin'},
    {code: 'gestionnaire', libelle: 'Gestionnaire'},
    {code: 'user', libelle: 'User'}
  ];

export interface Libelle {
  code: string;
  libelle: string
};

export const AVIS = [
  { value: 'FAV', label: 'Avis favorable' },
  { value: 'DEF', label: 'Avis défavorable' },
  { value: 'NOF', label: 'Avis non fourni' }
];


export const TYPE_FRAIS = [
  { code: 'FD', label: 'Frais de dossier' },
  { code: 'GA', label: 'Garantie' },
  { code: 'RD', label: 'Redevance annuelle' },
  { code: 'RC', label: 'Redevance de contrôle' },
  { code: 'EL', label: 'Electricité' },
  { code: 'LO', label: 'Loyer' },
  { code: 'IN', label: 'Inscription' },
  { code: 'RA', label: 'Restauration' },
  { code: 'DA', label: "Dossier d'Appel d'Offre" },
  { code: 'DI', label: "Prestations diverses" }
];

export const ETATS_FACTURE = [
  { code: 'EN_ATTENTE', label: 'En Attente paiement' },
  { code: 'PAYEE', label: 'Payée' }
];
