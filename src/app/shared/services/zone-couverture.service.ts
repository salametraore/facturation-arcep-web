import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ZoneCouverture} from "../models/zone-couverture";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ZoneCouvertureService {

  private baseUrl = environment.baseUrl +'/zone-couverture'

  constructor(private http: HttpClient) { }


  create(zoneCouverture: ZoneCouverture): Observable<ZoneCouverture> {
    return this.http.post<ZoneCouverture>(`${this.baseUrl}/`, zoneCouverture);
  }

  getListItems(): Observable<ZoneCouverture[]> {
    return this.http.get<ZoneCouverture[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<ZoneCouverture> {
    return this.http.get<ZoneCouverture>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, zoneCouverture: ZoneCouverture): Observable<ZoneCouverture> {
    return this.http.put<ZoneCouverture>(`${this.baseUrl}/${id}/`, zoneCouverture);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
