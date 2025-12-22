import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';

/** ==== Types (à adapter à tes models TS si tu les as déjà) ==== */
export interface RecouvGroupe {
  id?: number;
  code: string;
  nom: string;
  description?: string | null;
  actif?: boolean;
  priority?: number;
  created_at?: string; // ISO
  updated_at?: string; // ISO
}

export interface RecouvGroupeMembre {
  id?: number;
  groupe?: number;     // en write
  groupe_id?: number;  // en read
  client_id: number;
  exclu?: boolean;
  motif_override?: string | null;
  updated_at?: string; // ISO
  client?: { id: number; code?: string | null; denomination?: string | null };
}

export interface PageResult<T> {
  count: number;
  results: T[];
}

/** Query list */
export interface RecouvGroupeListQuery {
  actif?: boolean;
  search?: string;
  ordering?: string; // ex: "-id" ou "code"
  page?: number;
  page_size?: number;
}

export interface RecouvGroupeMembresQuery {
  exclu?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RecouvGroupeService {
  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** baseUrl est supposé être .../facturation_api */
  private get base(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/groupes`;
  }

  // ---------------------------
  // Groupes CRUD
  // ---------------------------
  list(q: RecouvGroupeListQuery = {}): Observable<PageResult<RecouvGroupe>> {
    let params = new HttpParams();
    if (q.actif !== undefined) params = params.set('actif', String(q.actif));
    if (q.search) params = params.set('search', q.search);
    if (q.ordering) params = params.set('ordering', q.ordering);
    if (q.page !== undefined) params = params.set('page', String(q.page));
    if (q.page_size !== undefined) params = params.set('page_size', String(q.page_size));

    return this.http.get<PageResult<RecouvGroupe>>(`${this.base}/`, { params });
  }

  get(id: number): Observable<RecouvGroupe> {
    return this.http.get<RecouvGroupe>(`${this.base}/${id}/`);
  }

  create(payload: RecouvGroupe): Observable<RecouvGroupe> {
    return this.http.post<RecouvGroupe>(`${this.base}/`, payload);
  }

  update(id: number, payload: RecouvGroupe): Observable<RecouvGroupe> {
    return this.http.put<RecouvGroupe>(`${this.base}/${id}/`, payload);
  }

  patch(id: number, payload: Partial<RecouvGroupe>): Observable<RecouvGroupe> {
    return this.http.patch<RecouvGroupe>(`${this.base}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }

  // ---------------------------
  // Membres (nested routes)
  // ---------------------------
  listMembres(groupeId: number, q: RecouvGroupeMembresQuery = {}): Observable<PageResult<RecouvGroupeMembre>> {
    let params = new HttpParams();
    if (q.exclu !== undefined) params = params.set('exclu', String(q.exclu));

    return this.http.get<PageResult<RecouvGroupeMembre>>(
      `${this.base}/${groupeId}/membres/`,
      { params }
    );
  }

  addMembre(groupeId: number, payload: Omit<RecouvGroupeMembre, 'id' | 'groupe_id' | 'updated_at' | 'client'>): Observable<RecouvGroupeMembre> {
    // côté backend, on force groupe via l'URL, mais si tu veux tu peux envoyer juste client_id/exclu/motif_override
    return this.http.post<RecouvGroupeMembre>(`${this.base}/${groupeId}/membres/`, payload);
  }

  patchMembre(groupeId: number, membreId: number, payload: Partial<RecouvGroupeMembre>): Observable<RecouvGroupeMembre> {
    return this.http.patch<RecouvGroupeMembre>(`${this.base}/${groupeId}/membres/${membreId}/`, payload);
  }

  deleteMembre(groupeId: number, membreId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${groupeId}/membres/${membreId}/`);
  }
}
