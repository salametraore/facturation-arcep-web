import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs';
import {TarifFraisDossierList} from "../models/tarifFraisDossierList";
import {TarifFraisDossierDetail} from "../models/tarifFraisDossierDetail";

@Injectable({
  providedIn: 'root'
})
export class TypeFraisService {
  private baseUrl = environment.baseUrl + '/tarifs-frais-dossier';

  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<TarifFraisDossierDetail> {
    return this.http.get<TarifFraisDossierDetail>(`${this.baseUrl}/${id}/`);
  }

  create(data: TarifFraisDossierDetail): Observable<TarifFraisDossierDetail> {
    return this.http.post<TarifFraisDossierDetail>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TarifFraisDossierDetail): Observable<TarifFraisDossierDetail> {
    return this.http.put<TarifFraisDossierDetail>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {responseType: 'text'});
  }

  getListItems(): Observable<TarifFraisDossierList[]> {
    return this.http.get<TarifFraisDossierList[]>(`${this.baseUrl}/`);
  }

}
