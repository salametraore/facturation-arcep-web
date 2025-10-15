import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Facture } from "../models/facture";
import {RequestGenererFacture} from "../models/ficheTechniques";

@Injectable({
  providedIn: 'root'
})
export class FactureService {

  private baseUrl = environment.baseUrl + '/factures';

  constructor(private http: HttpClient) {}

  getItem(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.baseUrl}/${id}`);
  }

  create(data: Facture ): Observable<Facture> {
    return this.http.post< Facture>(`${this.baseUrl}`,data);
  }


  update(id: number,value: Facture): Observable<Facture> {
    return this.http.put<Facture>(`${this.baseUrl}/${id}/`, value);
  }


  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getListItems() : Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.baseUrl}`);
  }

  getListeFacturesByClientId(id:number) : Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.baseUrl}/client/${id}`);
  }

  getListFacturesByEtat(id:number,etat:string) : Observable<Facture[]> {//PAYEE ou EN_ATTENTE
    let params = new HttpParams();
    params.set('etat',etat)
    return this.http.get<Facture[]>(`${this.baseUrl}/client/${id}`,{params});
  }

  getFacturesEnAttentesByClientId(client_id:number) : Observable<Facture[]> {
    let params = new HttpParams();
    params.set('client',client_id.toString())
    return this.http.get<Facture[]>(`${this.baseUrl}/`, {params});
  }

  /**
   * Génère une facture de frais de dossier
   */
  genererFraisDossier(payload: RequestGenererFacture): Observable<any> {
    console.log(payload);
    return this.http.post(`${environment.baseUrl}/generer-frais-dossier-facture/`, payload);
  }

  /**
   * Génère une facture de frais de redevance
   */
  genererFraisRedevance(payload: RequestGenererFacture): Observable<any> {
    console.log(payload);
    return this.http.post(`${environment.baseUrl}/generer-frais-redevance-facture/`, payload);
  }

  genererFacturePDF(facture_id: number) {
    //const url = ${this.baseUrl}/generate-pdf/${facture_id};
    const url = `${this.baseUrl}/generate-pdf/${facture_id}`
    const httpOptions = {
      'responseType': 'arraybuffer' as 'json'
    };
    return this.http.get<any>(url, httpOptions);
  }

}
