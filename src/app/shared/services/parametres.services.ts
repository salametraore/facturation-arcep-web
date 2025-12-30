// src/app/shared/services/parametre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { Parametre, ParametreRequest, toParametreRequest } from '../models/parametres';

@Injectable({ providedIn: 'root' })
export class ParametreService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlParametres(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/parametres`;
  }

  /** LIST */
  getItems(): Observable<Parametre[]> {
    return this.http.get<Parametre[]>(`${this.urlParametres}/`);
  }

  /** READ */
  getItem(id: number): Observable<Parametre> {
    return this.http.get<Parametre>(`${this.urlParametres}/${id}/`);
  }

  /** CREATE: body = ParametreRequest */
  create(p: ParametreRequest | Parametre): Observable<Parametre> {
    const payload: ParametreRequest =
      'id' in (p as any) ? toParametreRequest(p as Parametre) : (p as ParametreRequest);

    return this.http.post<Parametre>(`${this.urlParametres}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = ParametreRequest */
  update(id: number, p: ParametreRequest | Parametre): Observable<Parametre> {
    const payload: ParametreRequest =
      'id' in (p as any) ? toParametreRequest(p as Parametre) : (p as ParametreRequest);

    return this.http.put<Parametre>(`${this.urlParametres}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<ParametreRequest> */
  patch(id: number, changes: Partial<ParametreRequest>): Observable<Parametre> {
    return this.http.patch<Parametre>(`${this.urlParametres}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlParametres}/${id}/`);
  }
}
