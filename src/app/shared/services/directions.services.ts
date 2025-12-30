import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { Direction, DirectionRequest, toDirectionRequest } from '../models/direction';

@Injectable({ providedIn: 'root' })
export class DirectionsService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlDirection(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/directions`;
  }

  /** LIST */
  getItems(): Observable<Direction[]> {
    return this.http.get<Direction[]>(`${this.urlDirection}/`);
  }

  /** READ */
  getItem(id: number): Observable<Direction> {
    return this.http.get<Direction>(`${this.urlDirection}/${id}/`);
  }

  /** CREATE: body = DirectionRequest */
  create(p: DirectionRequest | Direction): Observable<Direction> {
    const payload: DirectionRequest =
      'id' in (p as any) ? toDirectionRequest(p as Direction) : (p as DirectionRequest);

    return this.http.post<Direction>(`${this.urlDirection}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = DirectionRequest */
  update(id: number, p: DirectionRequest | Direction): Observable<Direction> {
    const payload: DirectionRequest =
      'id' in (p as any) ? toDirectionRequest(p as Direction) : (p as DirectionRequest);

    return this.http.put<Direction>(`${this.urlDirection}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<DirectionRequest> */
  patch(id: number, changes: Partial<DirectionRequest>): Observable<Direction> {
    return this.http.patch<Direction>(`${this.urlDirection}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlDirection}/${id}/`);
  }
}
