  import { environment } from '../../../environments/environment';
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import {EncaissementDetail} from "../models/encaissementDetail";
  import {EncaissementList} from "../models/encaissementList";
  import {EncaissementDTO} from "../models/encaissementDTO";
  import {RecouvListeEncaissement} from "../models/recouv-liste-encaissement";
  import {Encaissement} from "../models/encaissement";
  @Injectable({  providedIn:  'root',})
export class EncaissementsService {
      private baseUrl = environment.baseUrl + '/encaissements';
      private baseUrl_2 = environment.baseUrl + '/recouv/liste-encaissements/';

      constructor(private http: HttpClient) {}

      getItem(id: number): Observable<EncaissementDetail> {
          return this.http.get<EncaissementDetail>(`${this.baseUrl}/${id}/`);
      }

      create(data: EncaissementDetail ): Observable<EncaissementDetail> {
        console.log(data)
          return this.http.post< EncaissementDetail>(`${this.baseUrl}/`,data);
       }

      update(id: number,value: EncaissementDetail): Observable<EncaissementDetail> {
        console.log(id)
        console.log(value)
          return this.http.put<EncaissementDetail>(`${this.baseUrl}/${id}/`, value);
       }

      delete(id: number): Observable<any> {
          return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
      }

      getListItems() : Observable<EncaissementList[]> {
          return this.http.get<EncaissementList[]>(`${this.baseUrl}/`);
      }

    getListencaissement() : Observable<RecouvListeEncaissement[]> {
      return this.http.get<RecouvListeEncaissement[]>(`${this.baseUrl_2}`);
    }
  }
