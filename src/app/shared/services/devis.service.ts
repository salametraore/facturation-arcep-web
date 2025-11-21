import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Devis ,GenererFactureFromDevisResponse} from '../models/devis';
import { RequestGenererFacture } from '../models/ficheTechniques';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class DevisService {

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

  private get urlDevis()     { return this.joinUrl(this.cfg.baseUrl, 'devis'); }


  // ---- CRUD Factures ----
  getItem(id: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.urlDevis}/${id}`);
  }

  create(data: Devis): Observable<Devis> {
    return this.http.post<Devis>(`${this.urlDevis}`, data);
  }

  update(id: number, value: Devis): Observable<Devis> {
    return this.http.put<Devis>(`${this.urlDevis}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlDevis}/${id}`, { responseType: 'text' });
  }

  getListItems(): Observable<Devis[]> {
    return this.http.get<Devis[]>(`${this.urlDevis}/`);
  }

  getListeDevisByClientId(id: number): Observable<Devis[]> {
    return this.http.get<Devis[]>(`${this.urlDevis}/client/${id}`);
  }

  getListFacturesByEtat(id: number, etat: string): Observable<Devis[]> {
    let params = new HttpParams();
    params = params.set('etat', etat); // HttpParams est immuable -> réassigner
    return this.http.get<Devis[]>(`${this.urlDevis}/client/${id}`, { params });
  }

  genererFactureFromDevis(devis_id: number) {
    const url = `${this.cfg.baseUrl}/generer-facture-from-devis/`;
    return this.http.post<GenererFactureFromDevisResponse>(url, {
      devis_id: devis_id
    });
  }

  genererDevisPDF(devis_id: number) {
    const url = `${this.urlDevis}/generate-pdf/${devis_id}/`;
    return this.http.get<ArrayBuffer>(url, {
      observe: 'response',
      responseType: 'arraybuffer' as 'json',
    }); // Observable<HttpResponse<ArrayBuffer>>
  }

  annulerDevis(devis_id: number): Observable<any> {
    return this.http.get(`${this.cfg.baseUrl}/devis-annuler/${devis_id}/`);
  }

}
