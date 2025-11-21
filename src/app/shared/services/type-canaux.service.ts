import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeCanalList } from '../models/typeCanalList';
import { TypeCanalDetail } from '../models/typeCanalDetail';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class TypeCanauxService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/type-canaux */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/type-canaux`;
  }

  getItem(id: number): Observable<TypeCanalDetail> {
    return this.http.get<TypeCanalDetail>(`${this.baseUrl}/${id}/`);
  }

  create(data: TypeCanalDetail): Observable<TypeCanalDetail> {
    return this.http.post<TypeCanalDetail>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TypeCanalDetail): Observable<TypeCanalDetail> {
    return this.http.put<TypeCanalDetail>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TypeCanalList[]> {
    return this.http.get<TypeCanalList[]>(`${this.baseUrl}/`);
  }
}
