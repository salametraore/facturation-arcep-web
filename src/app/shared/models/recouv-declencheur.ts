import { RecouvGroupe } from './recouv-groupe';
import { RecouvPlanAction } from './recouv-plan-action';

export type RecouvDeclencheurScopeEnum = 'TOUS' | 'MEMBRES_GROUPE';
export type TypeDelaiEnum = 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';

export class RecouvDeclencheur {
  readonly id!: number;

  readonly groupe_detail?: RecouvGroupe;
  readonly plan_action_detail?: RecouvPlanAction;

  created_at?: string;
  updated_at?: string;

  code!: string;
  nom!: string;
  description?: string | null;

  actif?: boolean;
  priority?: number | null;

  scope?: RecouvDeclencheurScopeEnum;

  type_client?: string | null;
  type_produit_service?: string | null;

  montant_min?: string | null;
  montant_max?: string | null;

  nb_factures_impayees_min?: number | null;

  type_delai!: TypeDelaiEnum;
  nb_jours!: number;

  created_by?: number | null;
  updated_by?: number | null;

  groupe!: number;
  plan_action!: number;
}

export type RecouvDeclencheurRequest =
  Omit<RecouvDeclencheur, 'id' | 'groupe_detail' | 'plan_action_detail'>;

export function toRecouvDeclencheurRequest(x: RecouvDeclencheur): RecouvDeclencheurRequest {
  const { id, groupe_detail, plan_action_detail, ...payload } = x as any;
  return payload as RecouvDeclencheurRequest;
}
