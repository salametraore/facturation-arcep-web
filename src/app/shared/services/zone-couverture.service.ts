import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ZoneCouverture, ZoneCouvertureDetailRequest} from '../models/zone-couverture';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ZoneCouvertureService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/zone-couverture */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/zone-couverture`;
  }

  create(zoneCouvertureRequest: ZoneCouvertureDetailRequest): Observable<ZoneCouverture> {
    return this.http.post<ZoneCouverture>(`${this.baseUrl}/`, zoneCouvertureRequest);
  }

  getListItems(): Observable<ZoneCouverture[]> {
    return this.http.get<ZoneCouverture[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<ZoneCouverture> {
    return this.http.get<ZoneCouverture>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, zoneCouvertureRequest: ZoneCouvertureDetailRequest): Observable<ZoneCouverture> {
    return this.http.put<ZoneCouverture>(`${this.baseUrl}/${id}/`, zoneCouvertureRequest);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
