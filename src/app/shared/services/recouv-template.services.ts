import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvTemplate, RecouvTemplateRequest, toRecouvTemplateRequest } from '../models/recouv-template';

@Injectable({ providedIn: 'root' })
export class RecouvTemplateServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvTemplate(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/templates`;
  }

  /** LIST */
  getItems(): Observable<RecouvTemplate[]> {
    return this.http.get<RecouvTemplate[]>(`${this.urlRecouvTemplate}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvTemplate> {
    return this.http.get<RecouvTemplate>(`${this.urlRecouvTemplate}/${id}/`);
  }

  /** CREATE: body = RecouvTemplateRequest */
  create(p: RecouvTemplateRequest | RecouvTemplate): Observable<RecouvTemplate> {
    const payload: RecouvTemplateRequest =
      'id' in (p as any) ? toRecouvTemplateRequest(p as RecouvTemplate) : (p as RecouvTemplateRequest);

    return this.http.post<RecouvTemplate>(`${this.urlRecouvTemplate}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvTemplateRequest */
  update(id: number, p: RecouvTemplateRequest | RecouvTemplate): Observable<RecouvTemplate> {
    const payload: RecouvTemplateRequest =
      'id' in (p as any) ? toRecouvTemplateRequest(p as RecouvTemplate) : (p as RecouvTemplateRequest);

    return this.http.put<RecouvTemplate>(`${this.urlRecouvTemplate}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvTemplateRequest> */
  patch(id: number, changes: Partial<RecouvTemplateRequest>): Observable<RecouvTemplate> {
    return this.http.patch<RecouvTemplate>(`${this.urlRecouvTemplate}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvTemplate}/${id}/`);
  }
}
