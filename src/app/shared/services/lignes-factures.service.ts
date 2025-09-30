  import { environment } from '../../../environments/environment';
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import {LignesFactures} from "../models/lignesFactures";
  @Injectable({  providedIn:  'root',})
export class LignesFacturesService {
      private baseUrl = environment.baseUrl + '/lignes-factures';

      constructor(private http: HttpClient) {}

      getItem(id: number): Observable<LignesFactures> {
          return this.http.get<LignesFactures>(`${this.baseUrl}/${id}`);
      }

      create(data: LignesFactures ): Observable<LignesFactures> {
          return this.http.post< LignesFactures>(`${this.baseUrl}`,data);
       }


      update(id: number,value: LignesFactures): Observable<LignesFactures> {
          return this.http.put<LignesFactures>(`${this.baseUrl}/${id}`, value);
       }

      delete(id: number): Observable<any> {
          return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
      }

      getListItems() : Observable<LignesFactures[]> {
          return this.http.get<LignesFactures[]>(`${this.baseUrl}`);
      }

}
