// src/app/shared/services/tarif-redevance-gestion.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TarifRedevanceGestion,
  TarifRedevanceGestionRequest
} from '../models/tarif-redevance-gestion.model';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class TarifRedevanceGestionService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/tarifs-redevance-gestion */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/tarifs-redevance`;
  }

  getItem(id: number): Observable<TarifRedevanceGestion> {
    return this.http.get<TarifRedevanceGestion>(`${this.baseUrl}/${id}/`);
  }

  create(data: TarifRedevanceGestionRequest): Observable<TarifRedevanceGestion> {
    return this.http.post<TarifRedevanceGestion>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TarifRedevanceGestionRequest): Observable<TarifRedevanceGestion> {
    return this.http.put<TarifRedevanceGestion>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    // même style que tes autres services (backend renvoie parfois du texte)
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TarifRedevanceGestion[]> {
    return this.http.get<TarifRedevanceGestion[]>(`${this.baseUrl}/`);
  }
}
