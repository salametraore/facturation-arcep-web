import { RecouvTemplate } from './recouv-template';

export type TypeActionEnum = 'EMAIL' | 'SMS' | 'COURRIER' | 'APPEL';
export type ModeExecutionEnum = 'AUTO' | 'SEMI_AUTO' | 'MANU';
export type TypeDelaiEnum = 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';

export interface RecouvPlanEtape {
  id: number;

  /** enrichi côté backend, lecture seule */
  template_detail?: RecouvTemplate;

  created_at?: string;
  updated_at?: string;

  ordre: number;
  type_action: TypeActionEnum;
  mode_execution: ModeExecutionEnum;
  type_delai: TypeDelaiEnum;
  nb_jours: number;

  actif?: boolean;

  created_by?: number | null;
  updated_by?: number | null;

  plan_action: number;
  template?: number | null;
}

/**
 * Payload d'écriture côté frontend.
 * On n'envoie pas les champs purement read-only / techniques.
 */
export interface RecouvPlanEtapeRequest {
  ordre: number;
  type_action: TypeActionEnum;
  mode_execution: ModeExecutionEnum;
  type_delai: TypeDelaiEnum;
  nb_jours: number;
  actif?: boolean;
  plan_action: number;
  template?: number | null;
}

export function toRecouvPlanEtapeRequest(x: RecouvPlanEtape): RecouvPlanEtapeRequest {
  return {
    ordre: x.ordre,
    type_action: x.type_action,
    mode_execution: x.mode_execution,
    type_delai: x.type_delai,
    nb_jours: x.nb_jours,
    actif: x.actif,
    plan_action: x.plan_action,
    template: x.template ?? null
  };
}
