// src/app/shared/services/fiches-techniques-frequence.service.ts

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {FicheTechniqueFrequenceRequest} from '../models/fiche-technique-frequence';
import {AppConfigService} from '../../core/config/app-config.service';
import {
  CalculFraisFrequenceRequest,
  FicheTechniqueFrequenceCreateRequest,
  FicheTechniqueFrequenceDetail
} from "../models/fiche-technique-frequence-create-request";

@Injectable({providedIn: 'root'})
export class FichesTechniquesFrequenceService {

  /** segment d’API (toujours sans slash de début/fin) */
  private readonly resource = 'fiches-techniques-station-frequences';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {
  }

  /** Base URL normalisée: {baseUrl}/{resource} (sans doubles slash) */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    const res = this.resource.replace(/^\/|\/$/g, '');
    return `${base}/${res}`;
  }

  create(fiche: FicheTechniqueFrequenceRequest): Observable<FicheTechniqueFrequenceRequest> {
    return this.http.post<FicheTechniqueFrequenceRequest>(`${this.baseUrl}/`, fiche);
  }

  initierFicheTechniqueFrequence(fiche: FicheTechniqueFrequenceCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.cfg.baseUrl}/fiches-techniques-initier-frequences/`, fiche);
  }


  getDetailFicheTechniqueFrequence(id: number): Observable<any> {
    return this.http.get<any>(`${this.cfg.baseUrl}/fiches-techniques-frequences-details/${id}/`);
  }

  getListeFicheTechniqueFrequence(): Observable<FicheTechniqueFrequenceDetail> {
    return this.http.get<FicheTechniqueFrequenceDetail>(`${this.cfg.baseUrl}/fiches-techniques-frequences-details-get/`);
  }

  updateFicheTechniqueFrequence(id: number, fiche: FicheTechniqueFrequenceCreateRequest): Observable<FicheTechniqueFrequenceDetail> {
    return this.http.put<FicheTechniqueFrequenceDetail>(`${this.cfg.baseUrl}/fiche-technique-frequence-update/${id}/`, fiche);
  }

  calculerFraisFicheTechniqueFrequence(fiche: CalculFraisFrequenceRequest): Observable<any> {
    return this.http.post<any>(`${this.cfg.baseUrl}/fiches-frequences/calculer/`, fiche);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

}
