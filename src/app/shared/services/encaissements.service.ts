import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EncaissementDetail } from '../models/encaissementDetail';
import { EncaissementList } from '../models/encaissementList';
import { EncaissementDTO } from '../models/encaissementDTO';
import { RecouvListeEncaissement } from '../models/recouv-liste-encaissement';
import { Encaissement } from '../models/encaissement';
import { Facture } from '../models/facture';
import { EncaissementDirectFicheTechniqueRequest } from '../models/encaissement-direct-request';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class EncaissementsService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Utilitaire pour assembler les segments proprement (évite //) */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,''))
      .join('/');
  }

  // --- Bases d’URL centralisées ---
  private get urlEncaissements()      { return this.joinUrl(this.cfg.baseUrl, 'encaissements'); }
  private get urlEncaissementDirect() { return this.joinUrl(this.cfg.baseUrl, 'encaissement-direct'); }
  private get urlRecouvListe()        { return this.joinUrl(this.cfg.baseUrl, 'recouv', 'liste-encaissements'); }
  private get urlRecuGenerate()       { return this.joinUrl(this.cfg.baseUrl, 'encaissement', 'generate-recu-pdf'); }

  // --- CRUD Encaissements ---
  getItem(id: number): Observable<EncaissementDetail> {
    return this.http.get<EncaissementDetail>(`${this.urlEncaissements}/${id}/`);
  }

  create(data: EncaissementDetail): Observable<EncaissementDetail> {
    return this.http.post<EncaissementDetail>(`${this.urlEncaissements}/`, data);
  }

  update(id: number, value: EncaissementDetail): Observable<EncaissementDetail> {
    return this.http.put<EncaissementDetail>(`${this.urlEncaissements}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEncaissements}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<EncaissementList[]> {
    return this.http.get<EncaissementList[]>(`${this.urlEncaissements}/`);
  }

  getListencaissement(): Observable<RecouvListeEncaissement[]> {
    return this.http.get<RecouvListeEncaissement[]>(`${this.urlRecouvListe}/`);
  }

  getListeEncaissementsByClientId(id: number): Observable<RecouvListeEncaissement[]> {
    return this.http.get<RecouvListeEncaissement[]>(`${this.urlEncaissements}/clients/${id}/`);
  }

  createEncaissementDirect(data: EncaissementDirectFicheTechniqueRequest): Observable<EncaissementDirectFicheTechniqueRequest> {
    return this.http.post<EncaissementDirectFicheTechniqueRequest>(`${this.urlEncaissementDirect}/`, data);
  }

  // --- Génération de reçu PDF ---
  genererRecuPDF(encaissement_id: number) {
    return this.http.get<ArrayBuffer>(
      `${this.urlRecuGenerate}/${encaissement_id}/`,
      { responseType: 'arraybuffer' as 'json' }
    );
  }



}
