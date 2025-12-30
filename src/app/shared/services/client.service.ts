import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client, ClientAutorisePostal, ClientRequest, toClientRequest } from '../models/client';
import { ReleveCompteClient } from '../models/ligne-releve-compte-client';
import { RecouvDashboardClient } from '../models/recouv-dashboard-client';

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
  private get urlClients()              { return this.joinUrl(this.cfg.baseUrl, 'clients'); }
  private get urlRecouv()               { return this.joinUrl(this.cfg.baseUrl, 'recouv'); }
  private get urlReleveClient()         { return this.joinUrl(this.cfg.baseUrl, 'releve-client'); }
  private get urlReleveGenerate()       { return this.joinUrl(this.cfg.baseUrl, 'releve/generate-pdf'); }
  private get urlClientAutorisePostal() { return this.joinUrl(this.cfg.baseUrl, 'clients/autorise-postal'); }

  // --- CRUD Clients ---
  getItems(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.urlClients}/`);
  }

  getItem(id: number): Observable<Client> {
    return this.httpClient.get<Client>(`${this.urlClients}/${id}/`);
  }

  /** CREATE: body = ClientRequest (pas de id) */
  create(client: ClientRequest | Client): Observable<Client> {
    const payload: ClientRequest = 'id' in (client as any) ? toClientRequest(client as Client) : (client as ClientRequest);
    return this.httpClient.post<Client>(`${this.urlClients}/`, payload);
  }

  /** UPDATE complet: id dans l'URL, body = ClientRequest (pas de id) */
  update(id: number, client: ClientRequest | Client): Observable<Client> {
    const payload: ClientRequest = 'id' in (client as any) ? toClientRequest(client as Client) : (client as ClientRequest);
    return this.httpClient.put<Client>(`${this.urlClients}/${id}/`, payload);
  }

  /** PATCH partiel: body = Partial<ClientRequest> */
  patch(id: number, changes: Partial<ClientRequest>): Observable<Client> {
    return this.httpClient.patch<Client>(`${this.urlClients}/${id}/`, changes);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.urlClients}/${id}/`);
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
      responseType: 'arraybuffer' as 'json'
    });
  }


  getListeClientsAutorisesPostal(): Observable<ClientAutorisePostal[]> {
    return this.httpClient
      .get<{ results: ClientAutorisePostal[] }>(`${this.urlClientAutorisePostal}/`)
      .pipe(map(resp => resp.results));
  }
}
