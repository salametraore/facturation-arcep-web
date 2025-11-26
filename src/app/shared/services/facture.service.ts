import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {ClientFactureDevisImpayes, Facture, GenererRedevanceRequest, GenererRedevanceResponse} from '../models/facture';
import { RequestGenererFacture } from '../models/ficheTechniques';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class FactureService {

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
  private get urlFactures()  { return this.joinUrl(this.cfg.baseUrl, 'factures'); }
  private get urlDevis()     { return this.joinUrl(this.cfg.baseUrl, 'devis'); }
  private get urlGenDossier(){ return this.joinUrl(this.cfg.baseUrl, 'generer-frais-dossier-facture'); }
  private get urlGenRed()    { return this.joinUrl(this.cfg.baseUrl, 'generer-frais-redevance-facture'); }

  // ---- CRUD Factures ----
  getItem(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.urlFactures}/${id}`);
  }

  create(data: Facture): Observable<Facture> {
    return this.http.post<Facture>(`${this.urlFactures}`, data);
  }

  update(id: number, value: Facture): Observable<Facture> {
    return this.http.put<Facture>(`${this.urlFactures}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlFactures}/${id}`, { responseType: 'text' });
  }

  getListItems(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.urlFactures}/`);
  }

  getListeFacturesByClientId(id: number): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.urlFactures}/client/${id}`);
  }

  getListFacturesByEtat(id: number, etat: string): Observable<Facture[]> { // PAYEE | EN_ATTENTE
    let params = new HttpParams();
    params = params.set('etat', etat); // HttpParams est immuable -> réassigner
    return this.http.get<Facture[]>(`${this.urlFactures}/client/${id}`, { params });
  }

  getFacturesEnAttentesByClientId(client_id: number): Observable<Facture[]> {
    let params = new HttpParams();
    params = params.set('client', String(client_id));
    return this.http.get<Facture[]>(`${this.urlFactures}/`, { params });
  }

  // ---- Générations côté serveur ----
  /** Génère une facture de frais de dossier */
  genererFraisDossier(payload: RequestGenererFacture): Observable<any> {
    return this.http.post(`${this.urlGenDossier}/`, payload);
  }

  /** Génère une facture de frais de redevance */
  genererFraisRedevance(payload: RequestGenererFacture): Observable<any> {
    return this.http.post(`${this.urlGenRed}/`, payload);
  }

  /** Génère les redevances annuelles */
  genererRedevancesAnnuelles(payload: GenererRedevanceRequest): Observable<GenererRedevanceResponse> {
    return this.http.post<GenererRedevanceResponse>(
      `${this.cfg.baseUrl}/generer-recurrence-annuelle/`,
      payload
    );
  }



  genererFacturePDF(facture_id: number) {
    const url = `${this.urlFactures}/generate-pdf/${facture_id}`;
    return this.http.get<ArrayBuffer>(url, {
      observe: 'response',
      responseType: 'arraybuffer' as 'json'
    }); // Observable<HttpResponse<ArrayBuffer>>
  }

  genererDevisPDF(devis_id: number) {
    const url = `${this.urlDevis}/generate-pdf/${devis_id}/`;
    return this.http.get<ArrayBuffer>(url, {
      observe: 'response',
      responseType: 'arraybuffer' as 'json',
    }); // Observable<HttpResponse<ArrayBuffer>>
  }

  annulerFacture(facture_id: number): Observable<any> {
    return this.http.get(`${this.cfg.baseUrl}/factures-annuler/${facture_id}/`);
  }

  getListeDevisEtFacturesImpayesByClientId(id: number): Observable<ClientFactureDevisImpayes[]> {
    return this.http.get<ClientFactureDevisImpayes[]>(`${this.cfg.baseUrl}/client-factures-devis-impayes/${id}/`);
  }

}
