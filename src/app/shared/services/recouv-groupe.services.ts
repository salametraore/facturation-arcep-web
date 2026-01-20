// src/app/shared/services/recouv-groupe.services.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvGroupe, RecouvGroupeRequest, toRecouvGroupeRequest } from '../models/recouv-groupe';

@Injectable({ providedIn: 'root' })
export class RecouvGroupeServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvGroupe(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/groupes`;
  }

  /** LIST */
  getItems(): Observable<RecouvGroupe[]> {
    return this.http.get<RecouvGroupe[]>(`${this.urlRecouvGroupe}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvGroupe> {
    return this.http.get<RecouvGroupe>(`${this.urlRecouvGroupe}/${id}/`);
  }

  /** CREATE: body = RecouvGroupeRequest */
  create(p: RecouvGroupeRequest | RecouvGroupe): Observable<RecouvGroupe> {
    const payload: RecouvGroupeRequest =
      'id' in (p as any) ? toRecouvGroupeRequest(p as RecouvGroupe) : (p as RecouvGroupeRequest);

    return this.http.post<RecouvGroupe>(`${this.urlRecouvGroupe}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvGroupeRequest */
  update(id: number, p: RecouvGroupeRequest | RecouvGroupe): Observable<RecouvGroupe> {
    const payload: RecouvGroupeRequest =
      'id' in (p as any) ? toRecouvGroupeRequest(p as RecouvGroupe) : (p as RecouvGroupeRequest);

    return this.http.put<RecouvGroupe>(`${this.urlRecouvGroupe}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvGroupeRequest> */
  patch(id: number, changes: Partial<RecouvGroupeRequest>): Observable<RecouvGroupe> {
    return this.http.patch<RecouvGroupe>(`${this.urlRecouvGroupe}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvGroupe}/${id}/`);
  }
}
