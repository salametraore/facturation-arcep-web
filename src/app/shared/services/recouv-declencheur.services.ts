import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvDeclencheur, RecouvDeclencheurRequest, toRecouvDeclencheurRequest } from '../models/recouv-declencheur';

@Injectable({ providedIn: 'root' })
export class RecouvDeclencheurServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvDeclencheur(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/declencheurs`;
  }

  /** LIST */
  getItems(): Observable<RecouvDeclencheur[]> {
    return this.http.get<RecouvDeclencheur[]>(`${this.urlRecouvDeclencheur}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvDeclencheur> {
    return this.http.get<RecouvDeclencheur>(`${this.urlRecouvDeclencheur}/${id}/`);
  }

  /** CREATE: body = RecouvDeclencheurRequest */
  create(p: RecouvDeclencheurRequest | RecouvDeclencheur): Observable<RecouvDeclencheur> {
    const payload: RecouvDeclencheurRequest =
      'id' in (p as any) ? toRecouvDeclencheurRequest(p as RecouvDeclencheur) : (p as RecouvDeclencheurRequest);

    return this.http.post<RecouvDeclencheur>(`${this.urlRecouvDeclencheur}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvDeclencheurRequest */
  update(id: number, p: RecouvDeclencheurRequest | RecouvDeclencheur): Observable<RecouvDeclencheur> {
    const payload: RecouvDeclencheurRequest =
      'id' in (p as any) ? toRecouvDeclencheurRequest(p as RecouvDeclencheur) : (p as RecouvDeclencheurRequest);

    return this.http.put<RecouvDeclencheur>(`${this.urlRecouvDeclencheur}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvDeclencheurRequest> */
  patch(id: number, changes: Partial<RecouvDeclencheurRequest>): Observable<RecouvDeclencheur> {
    return this.http.patch<RecouvDeclencheur>(`${this.urlRecouvDeclencheur}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvDeclencheur}/${id}/`);
  }

}
