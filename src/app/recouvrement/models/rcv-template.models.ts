export type RcvCanal = 'EMAIL' | 'SMS' | 'COURRIER' | 'LETTRE' | 'APPEL';

export interface RcvTemplate {
  id: number;
  code: string;
  nom: string;
  canal: RcvCanal;
  sujet?: string | null;
  contenu: string;
  actif: boolean;
  variables?: any; // json optionnel
}

export type RcvTemplateUpsert = Omit<RcvTemplate, 'id'>;

/** Normalisation UI : on veut afficher "COURRIER" même si seed = "LETTRE" */
export function normalizeCanal(canal: string): RcvCanal {
  const c = String(canal || '').toUpperCase();
  if (c === 'LETTRE') return 'COURRIER';
  if (c === 'COURRIER') return 'COURRIER';
  if (c === 'EMAIL') return 'EMAIL';
  if (c === 'SMS') return 'SMS';
  if (c === 'APPEL') return 'APPEL';
  return 'SMS';
}

export function canalLabel(canal: string): string {
  const c = String(canal || '').toUpperCase();
  if (c === 'LETTRE' || c === 'COURRIER') return 'Courrier';
  if (c === 'EMAIL') return 'Email';
  if (c === 'SMS') return 'SMS';
  if (c === 'APPEL') return 'Appel';
  return c;
}
