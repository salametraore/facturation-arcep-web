// src/app/shared/services/fiches-techniques-frequence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FicheTechniqueFrequenceRequest } from '../models/fiche-technique-frequence';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class FichesTechniquesFrequenceService {

  /** segment d’API (toujours sans slash de début/fin) */
  private readonly resource = 'fiches-techniques-station-frequences';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée: {baseUrl}/{resource} (sans doubles slash) */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    const res  = this.resource.replace(/^\/|\/$/g, '');
    return `${base}/${res}`;
  }

  create(fiche: FicheTechniqueFrequenceRequest): Observable<FicheTechniqueFrequenceRequest> {
    return this.http.post<FicheTechniqueFrequenceRequest>(`${this.baseUrl}/`, fiche);
  }

  getListItems(): Observable<FicheTechniqueFrequenceRequest[]> {
    return this.http.get<FicheTechniqueFrequenceRequest[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<FicheTechniqueFrequenceRequest> {
    return this.http.get<FicheTechniqueFrequenceRequest>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, fiche: FicheTechniqueFrequenceRequest): Observable<FicheTechniqueFrequenceRequest> {
    return this.http.put<FicheTechniqueFrequenceRequest>(`${this.baseUrl}/${id}/`, fiche);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
