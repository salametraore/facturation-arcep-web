import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';

import {
  RecouvGroupeMembre,
  RecouvGroupeMembreRequest,
  toRecouvGroupeMembreRequest
} from "../models/recouv-groupe-membre";

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
  getItems(): Observable<RecouvGroupeMembre[]> {
    return this.http.get<RecouvGroupeMembre[]>(`${this.urlRecouvGroupeMembre}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvGroupeMembre> {
    return this.http.get<RecouvGroupeMembre>(`${this.urlRecouvGroupeMembre}/${id}/`);
  }

  /** CREATE: body = RecouvActionLogRequest */
  create(p: RecouvGroupeMembreRequest | RecouvGroupeMembre): Observable<RecouvGroupeMembre> {
    const payload: RecouvGroupeMembreRequest =
      'id' in (p as any) ? toRecouvGroupeMembreRequest(p as RecouvGroupeMembre) : (p as RecouvGroupeMembreRequest);

    return this.http.post<RecouvGroupeMembre>(`${this.urlRecouvGroupeMembre}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvActionLogRequest */
  update(id: number, p: RecouvGroupeMembreRequest | RecouvGroupeMembre): Observable<RecouvGroupeMembre> {
    const payload: RecouvGroupeMembreRequest =
      'id' in (p as any) ? toRecouvGroupeMembreRequest(p as RecouvGroupeMembre) : (p as RecouvGroupeMembreRequest);

    return this.http.put<RecouvGroupeMembre>(`${this.urlRecouvGroupeMembre}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvActionLogRequest> */
  patch(id: number, changes: Partial<RecouvGroupeMembreRequest>): Observable<RecouvGroupeMembre> {
    return this.http.patch<RecouvGroupeMembre>(`${this.urlRecouvGroupeMembre}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvGroupeMembre}/${id}/`);
  }
}
