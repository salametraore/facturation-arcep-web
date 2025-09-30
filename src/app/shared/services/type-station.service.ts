import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/dist/types";
import {TypeStation} from "../models/type-station";

@Injectable({
  providedIn: 'root'
})
export class TypeStationService {
  private baseUrl = environment.baseUrl + '/type-station';

  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<TypeStation> {
    return this.http.get<TypeStation>(`${this.baseUrl}/${id}/`);
  }

  create(data: TypeStation): Observable<TypeStation> {
    return this.http.post<TypeStation>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TypeStation): Observable<TypeStation> {
    return this.http.put<TypeStation>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {responseType: 'text'});
  }

  getListItems(): Observable<TypeStation[]> {
    return this.http.get<TypeStation[]>(`${this.baseUrl}/`);
  }

}
