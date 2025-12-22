import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';

/**
 * Types minimaux (tu peux les déplacer dans ../models/recouvrement.ts si tu veux).
 * Ils correspondent aux champs du RecouvDeclencheurWriteSerializer.
 */
export interface RecouvDeclencheur {
  id?: number;

  groupe: number;          // FK id
  plan_action: number;     // FK id

  code: string;
  nom: string;
  description?: string | null;

  actif?: boolean;
  priority?: number;

  scope?: 'TOUS' | 'MEMBRES_GROUPE';

  type_client?: string | null;
  type_produit_service?: string | null;

  montant_min?: number | string | null;
  montant_max?: number | string | null;
  nb_factures_impayees_min?: number | null;

  type_delai: 'AVANT_ECHEANCE' | 'APRES_ECHEANCE';
  nb_jours: number;

  created_at?: string;
  updated_at?: string;
}

/** Helpers pour le listing (django-filter + search + ordering DRF) */
export interface RecouvDeclencheurListQuery {
  // django-filter
  actif?: boolean;
  groupe_id?: number;
  plan_action_id?: number;
  type_delai?: string;

  // DRF SearchFilter (search_fields)
  search?: string;

  // DRF OrderingFilter
  ordering?: string; // ex: "-priority" ou "code"
}

@Injectable({ providedIn: 'root' })
export class RecouvDeclencheurService {
  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlDeclencheurs(): string {
    // cfg.baseUrl ex: http://localhost:8000/facturation_api
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    return `${base}/recouvrement/declencheurs`;
  }

  /** CRUD */
  create(payload: RecouvDeclencheur): Observable<RecouvDeclencheur> {
    return this.http.post<RecouvDeclencheur>(`${this.urlDeclencheurs}/`, payload);
  }

  list(query?: RecouvDeclencheurListQuery): Observable<RecouvDeclencheur[]> {
    const params = this.buildParams(query);
    return this.http.get<RecouvDeclencheur[]>(`${this.urlDeclencheurs}/`, { params });
  }

  getItem(id: number): Observable<RecouvDeclencheur> {
    return this.http.get<RecouvDeclencheur>(`${this.urlDeclencheurs}/${id}/`);
  }

  update(id: number, payload: RecouvDeclencheur): Observable<RecouvDeclencheur> {
    return this.http.put<RecouvDeclencheur>(`${this.urlDeclencheurs}/${id}/`, payload);
  }

  patch(id: number, payload: Partial<RecouvDeclencheur>): Observable<RecouvDeclencheur> {
    return this.http.patch<RecouvDeclencheur>(`${this.urlDeclencheurs}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlDeclencheurs}/${id}/`);
  }

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------
  private buildParams(query?: RecouvDeclencheurListQuery): HttpParams {
    let params = new HttpParams();

    if (!query) return params;

    // django-filter
    if (query.actif !== undefined) params = params.set('actif', String(query.actif));
    if (query.groupe_id !== undefined && query.groupe_id !== null) params = params.set('groupe_id', String(query.groupe_id));
    if (query.plan_action_id !== undefined && query.plan_action_id !== null) params = params.set('plan_action_id', String(query.plan_action_id));
    if (query.type_delai) params = params.set('type_delai', query.type_delai);

    // DRF search + ordering
    if (query.search) params = params.set('search', query.search);
    if (query.ordering) params = params.set('ordering', query.ordering);

    return params;
  }
}
