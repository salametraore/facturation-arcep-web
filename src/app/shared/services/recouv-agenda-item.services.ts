import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvAgendaItem, RecouvAgendaItemRequest, toRecouvAgendaItemRequest } from '../models/recouv-agenda-item';

@Injectable({ providedIn: 'root' })
export class RecouvAgendaItemServices {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlRecouvAgendaItem(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/agenda-items`;
  }

  /** LIST */
  getItems(): Observable<RecouvAgendaItem[]> {
    return this.http.get<RecouvAgendaItem[]>(`${this.urlRecouvAgendaItem}/`);
  }

  /** READ */
  getItem(id: number): Observable<RecouvAgendaItem> {
    return this.http.get<RecouvAgendaItem>(`${this.urlRecouvAgendaItem}/${id}/`);
  }

  /** CREATE: body = RecouvAgendaItemRequest */
  create(p: RecouvAgendaItemRequest | RecouvAgendaItem): Observable<RecouvAgendaItem> {
    const payload: RecouvAgendaItemRequest =
      'id' in (p as any) ? toRecouvAgendaItemRequest(p as RecouvAgendaItem) : (p as RecouvAgendaItemRequest);

    return this.http.post<RecouvAgendaItem>(`${this.urlRecouvAgendaItem}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = RecouvAgendaItemRequest */
  update(id: number, p: RecouvAgendaItemRequest | RecouvAgendaItem): Observable<RecouvAgendaItem> {
    const payload: RecouvAgendaItemRequest =
      'id' in (p as any) ? toRecouvAgendaItemRequest(p as RecouvAgendaItem) : (p as RecouvAgendaItemRequest);

    return this.http.put<RecouvAgendaItem>(`${this.urlRecouvAgendaItem}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<RecouvAgendaItemRequest> */
  patch(id: number, changes: Partial<RecouvAgendaItemRequest>): Observable<RecouvAgendaItem> {
    return this.http.patch<RecouvAgendaItem>(`${this.urlRecouvAgendaItem}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRecouvAgendaItem}/${id}/`);
  }
}
