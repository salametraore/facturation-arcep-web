import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvPlanAction, RecouvPlanActionRequest, toRecouvPlanActionRequest } from '../models/recouv-plan-action';

@Injectable({ providedIn: 'root' })
export class RecouvPlanActionServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvPlanAction(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/plans-actions`;
  }

  /** LIST */
  getItems(): Observable<RecouvPlanAction[]> {
    return this.http.get<RecouvPlanAction[]>(`${this.urlRecouvPlanAction}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvPlanAction> {
    return this.http.get<RecouvPlanAction>(`${this.urlRecouvPlanAction}/${id}/`);
  }

  /** CREATE: body = RecouvPlanActionRequest */
  create(p: RecouvPlanActionRequest | RecouvPlanAction): Observable<RecouvPlanAction> {
    const payload: RecouvPlanActionRequest =
      'id' in (p as any) ? toRecouvPlanActionRequest(p as RecouvPlanAction) : (p as RecouvPlanActionRequest);

    return this.http.post<RecouvPlanAction>(`${this.urlRecouvPlanAction}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvPlanActionRequest */
  update(id: number, p: RecouvPlanActionRequest | RecouvPlanAction): Observable<RecouvPlanAction> {
    const payload: RecouvPlanActionRequest =
      'id' in (p as any) ? toRecouvPlanActionRequest(p as RecouvPlanAction) : (p as RecouvPlanActionRequest);

    return this.http.put<RecouvPlanAction>(`${this.urlRecouvPlanAction}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvPlanActionRequest> */
  patch(id: number, changes: Partial<RecouvPlanActionRequest>): Observable<RecouvPlanAction> {
    return this.http.patch<RecouvPlanAction>(`${this.urlRecouvPlanAction}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvPlanAction}/${id}/`);
  }

}
