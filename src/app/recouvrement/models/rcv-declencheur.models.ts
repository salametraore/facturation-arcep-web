export type RcvTypeClient = 'ENTREPRISE' | 'PME' | 'PUBLIC' | 'PARTICULIER';
export type RcvTypeDelai = 'AVANT' | 'APRES';

export interface RcvDeclencheurCriteres {
  type_client?: RcvTypeClient[];
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
  description?: string;
  groupe_id: number;
  plan_action_id?: number;
  actif: boolean;
  criteres: RcvDeclencheurCriteres;
}

export type RcvDeclencheurUpsert = Omit<RcvDeclencheur, 'id'>;

export function criteresToDelai(criteres?: RcvDeclencheurCriteres): { typeDelai: RcvTypeDelai; nbJours: number } {
  const c = criteres || {};
  if (typeof c.jours_avant_echeance_min === 'number') return { typeDelai: 'AVANT', nbJours: c.jours_avant_echeance_min };
  if (typeof c.jours_apres_echeance_min === 'number') return { typeDelai: 'APRES', nbJours: c.jours_apres_echeance_min };
  return { typeDelai: 'APRES', nbJours: 0 };
}

export function delaiToCriteresPatch(typeDelai: RcvTypeDelai, nbJours: number): Partial<RcvDeclencheurCriteres> {
  const n = Number(nbJours || 0);
  return typeDelai === 'AVANT'
    ? { jours_avant_echeance_min: n, jours_apres_echeance_min: null }
    : { jours_apres_echeance_min: n, jours_avant_echeance_min: null };
}
