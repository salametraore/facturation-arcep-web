import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { TypeDirection, TypeDirectionRequest, toTypeDirectionRequest } from '../models/typeDirection';

@Injectable({ providedIn: 'root' })
export class TypeDirectionsService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée */
  private get urlTypeDirection(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/type-directions`;
  }

  /** LIST */
  getItems(): Observable<TypeDirection[]> {
    return this.http.get<TypeDirection[]>(`${this.urlTypeDirection}/`);
  }

  /** READ */
  getItem(id: number): Observable<TypeDirection> {
    return this.http.get<TypeDirection>(`${this.urlTypeDirection}/${id}/`);
  }

  /** CREATE: body = TypeDirectionRequest */
  create(p: TypeDirectionRequest | TypeDirection): Observable<TypeDirection> {
    const payload: TypeDirectionRequest =
      'id' in (p as any) ? toTypeDirectionRequest(p as TypeDirection) : (p as TypeDirectionRequest);

    return this.http.post<TypeDirection>(`${this.urlTypeDirection}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = TypeDirectionRequest */
  update(id: number, p: TypeDirectionRequest | TypeDirection): Observable<TypeDirection> {
    const payload: TypeDirectionRequest =
      'id' in (p as any) ? toTypeDirectionRequest(p as TypeDirection) : (p as TypeDirectionRequest);

    return this.http.put<TypeDirection>(`${this.urlTypeDirection}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<TypeDirectionRequest> */
  patch(id: number, changes: Partial<TypeDirectionRequest>): Observable<TypeDirection> {
    return this.http.patch<TypeDirection>(`${this.urlTypeDirection}/${id}/`, changes);
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlTypeDirection}/${id}/`);
  }
}
