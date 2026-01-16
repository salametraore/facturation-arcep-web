// src/app/shared/services/tarif-frais-dossier.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TarifFraisDossier,
  TarifFraisDossierRequest
} from '../models/tarif-frais-dossier.model';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class TarifFraisDossierService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/tarifs-frais-dossier */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/tarifs-frais-dossier`;
  }

  getItem(id: number): Observable<TarifFraisDossier> {
    return this.http.get<TarifFraisDossier>(`${this.baseUrl}/${id}/`);
  }

  create(data: TarifFraisDossierRequest): Observable<TarifFraisDossier> {
    return this.http.post<TarifFraisDossier>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TarifFraisDossierRequest): Observable<TarifFraisDossier> {
    return this.http.put<TarifFraisDossier>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    // même style que TypeStationService (API renvoie souvent du texte)
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TarifFraisDossier[]> {
    return this.http.get<TarifFraisDossier[]>(`${this.baseUrl}/`);
  }
}
