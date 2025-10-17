  import { environment } from '../../../environments/environment';
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import {EncaissementDetail} from "../models/encaissementDetail";
  import {EncaissementList} from "../models/encaissementList";
  import {EncaissementDTO} from "../models/encaissementDTO";
  import {RecouvListeEncaissement} from "../models/recouv-liste-encaissement";
  import {Encaissement} from "../models/encaissement";
  import {Facture} from "../models/facture";
  import {EncaissementDirectFicheTechniqueRequest} from "../models/encaissement-direct-request";
  @Injectable({  providedIn:  'root',})
export class EncaissementsService {
      private baseUrl = environment.baseUrl + '/encaissements';
      private baseUrl3 = environment.baseUrl + '/encaissement-direct';
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

 /*   getListencaissement() : Observable<Encaissement[]> {
      return this.http.get<Encaissement[]>(`${this.baseUrl_2}`);
    }*/

    getListencaissement() : Observable<RecouvListeEncaissement[]> {
      return this.http.get<RecouvListeEncaissement[]>(`${this.baseUrl_2}`);
    }

    getListeEncaissementsByClientId(id:number) : Observable<RecouvListeEncaissement[]> {
      return this.http.get<RecouvListeEncaissement[]>(`${this.baseUrl}/clients/${id}/`);
    }

    createEncaissementDirect(data: EncaissementDirectFicheTechniqueRequest ): Observable<EncaissementDirectFicheTechniqueRequest> {
      console.log(data)
      return this.http.post< EncaissementDirectFicheTechniqueRequest>(`${this.baseUrl3}/`,data);
    }


    genererRecuPDF(encaissement_id: number) {
      const url = `${environment.baseUrl}/encaissement/generate-recu-pdf/${encaissement_id}/`
      const httpOptions = {
        'responseType': 'arraybuffer' as 'json'
      };
      return this.http.get<any>(url, httpOptions);
    }
  }
