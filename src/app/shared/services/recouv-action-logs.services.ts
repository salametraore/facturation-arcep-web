// src/app/shared/services/recouv-action-logs.services.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvActionLog, RecouvActionLogRequest, toRecouvActionLogRequest } from '../models/recouv-action-log';

@Injectable({ providedIn: 'root' })
export class RecouvActionLogsServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlActionLogs(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/action-logs`;
  }

  /** LIST */
  getItems(): Observable<RecouvActionLog[]> {
    return this.http.get<RecouvActionLog[]>(`${this.urlActionLogs}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvActionLog> {
    return this.http.get<RecouvActionLog>(`${this.urlActionLogs}/${id}/`);
  }

  /** CREATE: body = RecouvActionLogRequest */
  create(p: RecouvActionLogRequest | RecouvActionLog): Observable<RecouvActionLog> {
    const payload: RecouvActionLogRequest =
      'id' in (p as any) ? toRecouvActionLogRequest(p as RecouvActionLog) : (p as RecouvActionLogRequest);

    return this.http.post<RecouvActionLog>(`${this.urlActionLogs}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvActionLogRequest */
  update(id: number, p: RecouvActionLogRequest | RecouvActionLog): Observable<RecouvActionLog> {
    const payload: RecouvActionLogRequest =
      'id' in (p as any) ? toRecouvActionLogRequest(p as RecouvActionLog) : (p as RecouvActionLogRequest);

    return this.http.put<RecouvActionLog>(`${this.urlActionLogs}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvActionLogRequest> */
  patch(id: number, changes: Partial<RecouvActionLogRequest>): Observable<RecouvActionLog> {
    return this.http.patch<RecouvActionLog>(`${this.urlActionLogs}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlActionLogs}/${id}/`);
  }
}
