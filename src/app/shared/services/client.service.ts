import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Client } from '../models/client';
import { DetailFicheClient } from '../models/detail-fiche-client';
import { LigneReleveCompteClient, ReleveCompteClient } from '../models/ligne-releve-compte-client';
import { RecouvDashboardClient } from '../models/recouv-dashboard-client';
import { RecouvListeEncaissement } from '../models/recouv-liste-encaissement';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ClientService {

  constructor(
    private httpClient: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Utilitaires pour joindre proprement les segments sans // */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,''))
      .join('/');
  }

  // --- URLs centralisées ---
  private get urlClients()        { return this.joinUrl(this.cfg.baseUrl, 'clients'); }
  private get urlRecouv()         { return this.joinUrl(this.cfg.baseUrl, 'recouv'); }
  private get urlReleveClient()   { return this.joinUrl(this.cfg.baseUrl, 'releve-client'); }
  private get urlReleveGenerate() { return this.joinUrl(this.cfg.baseUrl, 'releve/generate-pdf'); }

  // --- CRUD Clients ---
  getItems(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.urlClients}/`);
  }

  getItem(id: any): Observable<Client> {
    return this.httpClient.get<Client>(`${this.urlClients}/${id}`);
  }

  create(client: Client): Observable<any> {
    return this.httpClient.post<any>(this.urlClients, client);
  }

  update(id: number, client: Client): Observable<any> {
    return this.httpClient.put<any>(`${this.urlClients}/${id}`, client);
  }

  delete(id: any): Observable<any> {
    return this.httpClient.delete(`${this.urlClients}/${id}`);
  }

  // --- Recouv / tableaux de bord / relevés ---
  getDetailFicheClients(): Observable<RecouvDashboardClient[]> {
    return this.httpClient.get<RecouvDashboardClient[]>(`${this.urlRecouv}/dashboard-clients/`);
  }

  getReleveCompteClient(): Observable<ReleveCompteClient[]> {
    return this.httpClient.get<ReleveCompteClient[]>(`${this.urlReleveClient}/`);
  }

  getReleveCompteClientByIdClient(id: number): Observable<ReleveCompteClient[]> {
    return this.httpClient.get<ReleveCompteClient[]>(`${this.urlReleveClient}/${id}/`);
  }

  genererRelevePDF(client_id: number) {
    const url = `${this.urlReleveGenerate}/${client_id}/`;
    return this.httpClient.get(url, {
      observe: 'response',
      responseType: 'blob'
    }); // -> Observable<HttpResponse<Blob>>
  }
}
