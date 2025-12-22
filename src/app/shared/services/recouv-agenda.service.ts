import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';

export interface RecouvAgendaItem {
  id: number;
  client_id: number;

  groupe_id: number;
  declencheur_id: number;
  plan_action_id: number;
  plan_etape_id: number;

  nb_factures: number;
  montant_total_restant: string | number;
  date_echeance_min?: string | null;

  type_action: string;
  mode_execution: string;
  date_planifiee: string;
  statut: string;

  agent_id?: number | null;
  priorite?: number | null;

  references_resume?: string;
  preview?: { subject?: string | null; body?: string | null };
  created_at?: string;
  updated_at?: string;
}

export interface RecouvAgendaExecuteRequest {
  resultat: 'SUCCES' | 'ECHEC';
  details?: string | null;
  canal_response?: any;
}

export interface RecouvAgendaReportRequest {
  new_date: string; // YYYY-MM-DD
  motif: string;
}

export interface RecouvAgendaCancelRequest {
  motif: string;
}

@Injectable({ providedIn: 'root' })
export class RecouvAgendaService {
  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get base(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  private get urlAgenda(): string {
    return `${this.base}/recouvrement/agenda`;
  }

  // -------- Listing / détail --------
  list(params?: {
    client_id?: number;
    statut?: string;
    type_action?: string;
    mode_execution?: string;
    date_from?: string; // YYYY-MM-DD
    date_to?: string;   // YYYY-MM-DD
    search?: string;
    ordering?: string; // ex: "date_planifiee" ou "-id"
    page?: number;
    page_size?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.client_id) httpParams = httpParams.set('client_id', String(params.client_id));
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.type_action) httpParams = httpParams.set('type_action', params.type_action);
    if (params?.mode_execution) httpParams = httpParams.set('mode_execution', params.mode_execution);
    if (params?.date_from) httpParams = httpParams.set('date_from', params.date_from);
    if (params?.date_to) httpParams = httpParams.set('date_to', params.date_to);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.ordering) httpParams = httpParams.set('ordering', params.ordering);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.page_size) httpParams = httpParams.set('page_size', String(params.page_size));

    return this.http.get<any>(`${this.urlAgenda}/`, { params: httpParams });
  }

  get(id: number): Observable<RecouvAgendaItem> {
    return this.http.get<RecouvAgendaItem>(`${this.urlAgenda}/${id}/`);
  }

  // -------- Sous-ressources --------
  getFactures(id: number): Observable<{ count: number; results: any[] }> {
    return this.http.get<{ count: number; results: any[] }>(`${this.urlAgenda}/${id}/factures/`);
  }

  getLogs(id: number): Observable<{ count: number; results: any[] }> {
    return this.http.get<{ count: number; results: any[] }>(`${this.urlAgenda}/${id}/logs/`);
  }

  // -------- Actions --------
  markEnCours(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.urlAgenda}/${id}/mark-en-cours/`, {});
  }

  execute(id: number, payload: RecouvAgendaExecuteRequest): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.urlAgenda}/${id}/execute/`, payload);
  }

  report(id: number, payload: RecouvAgendaReportRequest): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.urlAgenda}/${id}/report/`, payload);
  }

  cancel(id: number, payload: RecouvAgendaCancelRequest): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.urlAgenda}/${id}/cancel/`, payload);
  }
}
