import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ModePaiement} from "../models/mode-paiement";

@Injectable({
  providedIn: 'root'
})
export class ModePaiementService {


  private url_backend = environment.baseUrl +'/modes-paiement';

  constructor(private httpClient: HttpClient) {
  }

  getItems(): Observable<ModePaiement[]> {
    return this.httpClient.get<ModePaiement[]>(`${this.url_backend}/`);
  }

  getItem(id: any): Observable<ModePaiement> {
    return this.httpClient.get<ModePaiement>(`${this.url_backend}/${id}/`);
  }

  create(ModePaiement: ModePaiement): Observable<any> {
    return this.httpClient.post<any>(`${this.url_backend}/`, ModePaiement);
  }

  update(id: number, modePaiement: ModePaiement): Observable<any> {
    return this.httpClient.put<any>(`${this.url_backend}/${id}/`, modePaiement);
  }

  delete(id: any): Observable<any> {
    return this.httpClient.delete(`${this.url_backend}/${id}/`);
  }
}
