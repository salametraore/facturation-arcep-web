import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvPlanEtape, RecouvPlanEtapeRequest, toRecouvPlanEtapeRequest } from '../models/recouv-plan-etape';

@Injectable({ providedIn: 'root' })
export class RecouvPlanEtapeServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvPlanEtape(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/plans-etapes`;
  }

  /** LIST */
  getItems(): Observable<RecouvPlanEtape[]> {
    return this.http.get<RecouvPlanEtape[]>(`${this.urlRecouvPlanEtape}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvPlanEtape> {
    return this.http.get<RecouvPlanEtape>(`${this.urlRecouvPlanEtape}/${id}/`);
  }

  /** CREATE: body = RecouvPlanEtapeRequest */
  create(p: RecouvPlanEtapeRequest | RecouvPlanEtape): Observable<RecouvPlanEtape> {
    const payload: RecouvPlanEtapeRequest =
      'id' in (p as any) ? toRecouvPlanEtapeRequest(p as RecouvPlanEtape) : (p as RecouvPlanEtapeRequest);

    return this.http.post<RecouvPlanEtape>(`${this.urlRecouvPlanEtape}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvPlanEtapeRequest */
  update(id: number, p: RecouvPlanEtapeRequest | RecouvPlanEtape): Observable<RecouvPlanEtape> {
    const payload: RecouvPlanEtapeRequest =
      'id' in (p as any) ? toRecouvPlanEtapeRequest(p as RecouvPlanEtape) : (p as RecouvPlanEtapeRequest);

    return this.http.put<RecouvPlanEtape>(`${this.urlRecouvPlanEtape}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvPlanEtapeRequest> */
  patch(id: number, changes: Partial<RecouvPlanEtapeRequest>): Observable<RecouvPlanEtape> {
    return this.http.patch<RecouvPlanEtape>(`${this.urlRecouvPlanEtape}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvPlanEtape}/${id}/`);
  }

}
