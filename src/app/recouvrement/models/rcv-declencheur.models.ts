export type RcvTypeClient = string;
export type RcvTypeDelai = 'AVANT' | 'APRES';

export interface RcvDeclencheurCriteres {
  type_client?: string[];
  produit_code?: string[];
  montant_min?: number | null;
  montant_max?: number | null;
  nb_factures_impayees_min?: number | null;
  jours_avant_echeance_min?: number | null;
  jours_apres_echeance_min?: number | null;
}

export interface RcvDeclencheur {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  actif?: boolean;

  groupe_id: number;
  groupe_label?: string | null;
  plan_action_id?: number | null;

  criteres: RcvDeclencheurCriteres;
}

export function criteresToDelai(
  c?: RcvDeclencheurCriteres | null
): { typeDelai: RcvTypeDelai; nbJours: number } {
  if (!c) {
    return { typeDelai: 'APRES', nbJours: 0 };
  }

  const avant = c.jours_avant_echeance_min;
  if (avant !== null && avant !== undefined && Number(avant) > 0) {
    return { typeDelai: 'AVANT', nbJours: Number(avant) };
  }

  const apres = c.jours_apres_echeance_min;
  if (apres !== null && apres !== undefined && Number(apres) > 0) {
    return { typeDelai: 'APRES', nbJours: Number(apres) };
  }

  return { typeDelai: 'APRES', nbJours: 0 };
}
