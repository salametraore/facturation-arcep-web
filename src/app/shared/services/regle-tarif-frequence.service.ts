// src/app/shared/services/regle-tarif-frequence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RegleTarifFrequence,
  RegleTarifFrequenceRequest
} from '../models/regle-tarif-frequence.model';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class RegleTarifFrequenceService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/regles-tarif-frequence */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/regles-tarif-frequences`;
  }

  // GET all
  getListItems(): Observable<RegleTarifFrequence[]> {
    return this.http.get<RegleTarifFrequence[]>(`${this.baseUrl}/`);
  }

  // GET by ID
  getItem(id: number): Observable<RegleTarifFrequence> {
    return this.http.get<RegleTarifFrequence>(`${this.baseUrl}/${id}/`);
  }

  // CREATE
  create(data: RegleTarifFrequenceRequest): Observable<RegleTarifFrequence> {
    return this.http.post<RegleTarifFrequence>(`${this.baseUrl}/`, data);
  }

  // UPDATE
  update(id: number, data: RegleTarifFrequenceRequest): Observable<RegleTarifFrequence> {
    return this.http.put<RegleTarifFrequence>(`${this.baseUrl}/${id}/`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    // même style que TypeStationService (API renvoie souvent du texte)
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }
}
