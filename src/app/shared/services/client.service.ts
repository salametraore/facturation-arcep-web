import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client';
import {DetailFicheClient} from "../models/detail-fiche-client";
import {LigneReleveCompteClient, ReleveCompteClient} from "../models/ligne-releve-compte-client";
import {RecouvDashboardClient} from "../models/recouv-dashboard-client";
import {RecouvListeEncaissement} from "../models/recouv-liste-encaissement";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private url_backend = environment.baseUrl +'/clients';
  private url_backend_2 = environment.baseUrl +'/recouv';
  private url_backend_3 = environment.baseUrl +'/releve-client/';
  private url_backend_4 = environment.baseUrl +'/releve/generate-pdf/';

  constructor(private httpClient: HttpClient) {
  }

  getItems(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.url_backend}/`);
  }

  getDetailFicheClients(): Observable<RecouvDashboardClient[]> {
    return this.httpClient.get<RecouvDashboardClient[]>(`${this.url_backend_2}/dashboard-clients/`);
  }

  getReleveCompteClient(): Observable<ReleveCompteClient[]> {
    return this.httpClient.get<ReleveCompteClient[]>(this.url_backend_3);
  }

  getReleveCompteClientByIdClient(id:number): Observable<ReleveCompteClient[]> {
    return this.httpClient.get<ReleveCompteClient[]>(`${this.url_backend_3}${id}/`);
  }



  getItem(id: any): Observable<Client> {
    return this.httpClient.get<Client>(`${this.url_backend}/${id}`);
  }

  create(client: Client): Observable<any> {
    return this.httpClient.post<any>(this.url_backend, client);
  }

  update(id: number, client: Client): Observable<any> {
    return this.httpClient.put<any>(`${this.url_backend}/${id}`, client);
  }

  delete(id: any): Observable<any> {
    return this.httpClient.delete(`${this.url_backend}/${id}`);
  }

  genererRelevePDF(client_id: number) {
    const url = `${environment.baseUrl}/releve/generate-pdf/${client_id}/`
    const httpOptions = {
      'responseType': 'arraybuffer' as 'json'
    };
    return this.httpClient.get<any>(url, httpOptions);
  }
}

