import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvActionLog, RecouvActionLogRequest, toRecouvActionLogRequest } from '../models/recouv-action-log';

@Injectable({ providedIn: 'root' })
export class RecouvGroupeMembreServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvGroupeMembre(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/groupes-membres`;
  }

  /** LIST */
  getItems(): Observable<RecouvActionLog[]> {
    return this.http.get<RecouvActionLog[]>(`${this.urlRecouvGroupeMembre}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvActionLog> {
    return this.http.get<RecouvActionLog>(`${this.urlRecouvGroupeMembre}/${id}/`);
  }

  /** CREATE: body = RecouvActionLogRequest */
  create(p: RecouvActionLogRequest | RecouvActionLog): Observable<RecouvActionLog> {
    const payload: RecouvActionLogRequest =
      'id' in (p as any) ? toRecouvActionLogRequest(p as RecouvActionLog) : (p as RecouvActionLogRequest);

    return this.http.post<RecouvActionLog>(`${this.urlRecouvGroupeMembre}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvActionLogRequest */
  update(id: number, p: RecouvActionLogRequest | RecouvActionLog): Observable<RecouvActionLog> {
    const payload: RecouvActionLogRequest =
      'id' in (p as any) ? toRecouvActionLogRequest(p as RecouvActionLog) : (p as RecouvActionLogRequest);

    return this.http.put<RecouvActionLog>(`${this.urlRecouvGroupeMembre}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvActionLogRequest> */
  patch(id: number, changes: Partial<RecouvActionLogRequest>): Observable<RecouvActionLog> {
    return this.http.patch<RecouvActionLog>(`${this.urlRecouvGroupeMembre}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvGroupeMembre}/${id}/`);
  }
}
