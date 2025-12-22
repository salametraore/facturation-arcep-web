import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';

/** ========= Models (min) ========= */
export interface RecouvPlanAction {
  id?: number;
  code: string;
  nom: string;
  actif?: boolean;
  created_at?: string; // selon ton backend
}

export interface RecouvPlanEtape {
  id?: number;
  plan_action: number;        // FK (write)
  ordre: number;
  type_action: 'EMAIL' | 'SMS' | 'COURRIER' | 'APPEL';
  mode_execution: 'AUTO' | 'SEMI_AUTO' | 'MANU';
  type_delai: 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';
  nb_jours: number;
  template?: number | null;   // FK template (write) - null si APPEL
  actif?: boolean;

  // read fields possibles
  created_at?: string;
  updated_at?: string;
}

export interface ApiListResponse<T> {
  count: number;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class RecouvPlansService {
  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouv(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement`;
  }

  private get urlPlans(): string {
    return `${this.urlRecouv}/plans`;
  }

  // ======================
  // CRUD Plans
  // ======================

  create(plan: RecouvPlanAction): Observable<RecouvPlanAction> {
    return this.http.post<RecouvPlanAction>(`${this.urlPlans}/`, plan);
  }

  list(): Observable<ApiListResponse<RecouvPlanAction>> {
    return this.http.get<ApiListResponse<RecouvPlanAction>>(`${this.urlPlans}/`);
  }

  get(id: number): Observable<RecouvPlanAction> {
    return this.http.get<RecouvPlanAction>(`${this.urlPlans}/${id}/`);
  }

  update(id: number, plan: RecouvPlanAction): Observable<RecouvPlanAction> {
    return this.http.put<RecouvPlanAction>(`${this.urlPlans}/${id}/`, plan);
  }

  patch(id: number, partial: Partial<RecouvPlanAction>): Observable<RecouvPlanAction> {
    return this.http.patch<RecouvPlanAction>(`${this.urlPlans}/${id}/`, partial);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlPlans}/${id}/`);
  }

  // ======================
  // Étapes (nested routes)
  // /plans/{id}/etapes/
  // /plans/{id}/etapes/{etape_id}/
  // /plans/{id}/etapes/reorder/
  // ======================

  listEtapes(planId: number): Observable<ApiListResponse<RecouvPlanEtape>> {
    return this.http.get<ApiListResponse<RecouvPlanEtape>>(`${this.urlPlans}/${planId}/etapes/`);
  }

  createEtape(planId: number, etape: Omit<RecouvPlanEtape, 'plan_action'>): Observable<RecouvPlanEtape> {
    // le backend force plan_action = planId dans la view
    return this.http.post<RecouvPlanEtape>(`${this.urlPlans}/${planId}/etapes/`, etape);
  }

  patchEtape(planId: number, etapeId: number, partial: Partial<RecouvPlanEtape>): Observable<RecouvPlanEtape> {
    return this.http.patch<RecouvPlanEtape>(`${this.urlPlans}/${planId}/etapes/${etapeId}/`, partial);
  }

  deleteEtape(planId: number, etapeId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlPlans}/${planId}/etapes/${etapeId}/`);
  }

  /** Reorder: ordered_ids = [3, 9, 1, ...] */
  reorderEtapes(planId: number, orderedIds: number[]): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(
      `${this.urlPlans}/${planId}/etapes/reorder/`,
      { ordered_ids: orderedIds }
    );
  }
}
