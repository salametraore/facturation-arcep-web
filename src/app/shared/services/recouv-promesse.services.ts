import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvPromesse, RecouvPromesseRequest, toRecouvPromesseRequest } from '../models/recouv-promesse';

@Injectable({ providedIn: 'root' })
export class RecouvPromesseServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvPromesse(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/promesses`;
  }

  /** LIST */
  getItems(): Observable<RecouvPromesse[]> {
    return this.http.get<RecouvPromesse[]>(`${this.urlRecouvPromesse}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvPromesse> {
    return this.http.get<RecouvPromesse>(`${this.urlRecouvPromesse}/${id}/`);
  }

  /** CREATE: body = RecouvPromesseRequest */
  create(p: RecouvPromesseRequest | RecouvPromesse): Observable<RecouvPromesse> {
    const payload: RecouvPromesseRequest =
      'id' in (p as any) ? toRecouvPromesseRequest(p as RecouvPromesse) : (p as RecouvPromesseRequest);

    return this.http.post<RecouvPromesse>(`${this.urlRecouvPromesse}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvPromesseRequest */
  update(id: number, p: RecouvPromesseRequest | RecouvPromesse): Observable<RecouvPromesse> {
    const payload: RecouvPromesseRequest =
      'id' in (p as any) ? toRecouvPromesseRequest(p as RecouvPromesse) : (p as RecouvPromesseRequest);

    return this.http.put<RecouvPromesse>(`${this.urlRecouvPromesse}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvPromesseRequest> */
  patch(id: number, changes: Partial<RecouvPromesseRequest>): Observable<RecouvPromesse> {
    return this.http.patch<RecouvPromesse>(`${this.urlRecouvPromesse}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvPromesse}/${id}/`);
  }

}
