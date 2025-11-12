import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LignesFactures } from '../models/lignesFactures';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class LignesFacturesService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Assemble les segments d’URL proprement (évite les //) */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,''))
      .join('/');
  }

  private get baseUrl(): string {
    return this.joinUrl(this.cfg.baseUrl, 'lignes-factures');
  }

  getItem(id: number): Observable<LignesFactures> {
    return this.http.get<LignesFactures>(`${this.baseUrl}/${id}`);
  }

  create(data: LignesFactures): Observable<LignesFactures> {
    return this.http.post<LignesFactures>(`${this.baseUrl}`, data);
  }

  update(id: number, value: LignesFactures): Observable<LignesFactures> {
    return this.http.put<LignesFactures>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getListItems(): Observable<LignesFactures[]> {
    return this.http.get<LignesFactures[]>(`${this.baseUrl}/`);
  }
}
