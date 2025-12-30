import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvOverride, RecouvOverrideRequest, toRecouvOverrideRequest } from '../models/recouv-override';

@Injectable({ providedIn: 'root' })
export class RecouvOverrideServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvOverride(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/overrides`;
  }

  /** LIST */
  getItems(): Observable<RecouvOverride[]> {
    return this.http.get<RecouvOverride[]>(`${this.urlRecouvOverride}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvOverride> {
    return this.http.get<RecouvOverride>(`${this.urlRecouvOverride}/${id}/`);
  }

  /** CREATE: body = RecouvOverrideRequest */
  create(p: RecouvOverrideRequest | RecouvOverride): Observable<RecouvOverride> {
    const payload: RecouvOverrideRequest =
      'id' in (p as any) ? toRecouvOverrideRequest(p as RecouvOverride) : (p as RecouvOverrideRequest);

    return this.http.post<RecouvOverride>(`${this.urlRecouvOverride}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvOverrideRequest */
  update(id: number, p: RecouvOverrideRequest | RecouvOverride): Observable<RecouvOverride> {
    const payload: RecouvOverrideRequest =
      'id' in (p as any) ? toRecouvOverrideRequest(p as RecouvOverride) : (p as RecouvOverrideRequest);

    return this.http.put<RecouvOverride>(`${this.urlRecouvOverride}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvOverrideRequest> */
  patch(id: number, changes: Partial<RecouvOverrideRequest>): Observable<RecouvOverride> {
    return this.http.patch<RecouvOverride>(`${this.urlRecouvOverride}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvOverride}/${id}/`);
  }

}
