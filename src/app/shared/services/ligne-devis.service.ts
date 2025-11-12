import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LigneDevis} from '../models/ligneDevis';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class LigneDevisService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Helper: assemble proprement sans doubles // */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/, '') : p.replace(/^\/+|\/+$/g, ''))
      .join('/');
  }

  // Bases d’URL centralisées

  private get urlLigneDevis()     { return this.joinUrl(this.cfg.baseUrl, 'lignes-devis'); }


  // ---- CRUD Factures ----
  getItem(id: number): Observable<LigneDevis> {
    return this.http.get<LigneDevis>(`${this.urlLigneDevis}/${id}`);
  }

  create(data: LigneDevis): Observable<LigneDevis> {
    return this.http.post<LigneDevis>(`${this.urlLigneDevis}`, data);
  }

  update(id: number, value: LigneDevis): Observable<LigneDevis> {
    return this.http.put<LigneDevis>(`${this.urlLigneDevis}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlLigneDevis}/${id}`, { responseType: 'text' });
  }

  getListItems(): Observable<LigneDevis[]> {
    return this.http.get<LigneDevis[]>(`${this.urlLigneDevis}/`);
  }




}
