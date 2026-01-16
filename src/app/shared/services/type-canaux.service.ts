import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TypeCanal, TypeCanalRequest} from '../models/typeCanal';
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

  getItem(id: number): Observable<TypeCanal> {
    return this.http.get<TypeCanal>(`${this.baseUrl}/${id}/`);
  }

  create(data: TypeCanalRequest): Observable<TypeCanal> {
    return this.http.post<TypeCanal>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TypeCanalRequest): Observable<TypeCanal> {
    return this.http.put<TypeCanal>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TypeCanal[]> {
    return this.http.get<TypeCanal[]>(`${this.baseUrl}/`);
  }
}
