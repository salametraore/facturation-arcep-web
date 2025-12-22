import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';

export interface RecouvTemplate {
  id?: number;
  code: string;
  canal: 'EMAIL' | 'SMS' | 'COURRIER' | string;
  nom: string;
  sujet?: string | null;
  contenu: string;
  variables?: any | null;
  actif?: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class RecouvTemplatesService {
  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get base(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement`;
  }

  private get urlTemplates(): string {
    return `${this.base}/templates`;
  }

  list(params?: Record<string, any>): Observable<RecouvTemplate[]> {
    return this.http.get<RecouvTemplate[]>(`${this.urlTemplates}/`, { params });
  }

  get(id: number): Observable<RecouvTemplate> {
    return this.http.get<RecouvTemplate>(`${this.urlTemplates}/${id}/`);
  }

  create(payload: RecouvTemplate): Observable<RecouvTemplate> {
    return this.http.post<RecouvTemplate>(`${this.urlTemplates}/`, payload);
  }

  update(id: number, payload: RecouvTemplate): Observable<RecouvTemplate> {
    return this.http.put<RecouvTemplate>(`${this.urlTemplates}/${id}/`, payload);
  }

  patch(id: number, payload: Partial<RecouvTemplate>): Observable<RecouvTemplate> {
    return this.http.patch<RecouvTemplate>(`${this.urlTemplates}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlTemplates}/${id}/`);
  }
}
