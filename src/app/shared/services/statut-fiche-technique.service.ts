import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatutFicheTechnique } from '../models/statut-fiche-technique';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class StatutFicheTechniqueService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/statuts-fiche-technique */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/statuts-fiche-technique`;
  }

  // GET all
  getListItems(): Observable<StatutFicheTechnique[]> {
    return this.http.get<StatutFicheTechnique[]>(`${this.baseUrl}/`);
  }

  // GET by ID
  getItem(id: number): Observable<StatutFicheTechnique> {
    return this.http.get<StatutFicheTechnique>(`${this.baseUrl}/${id}/`);
  }

  // CREATE
  create(data: StatutFicheTechnique): Observable<StatutFicheTechnique> {
    return this.http.post<StatutFicheTechnique>(`${this.baseUrl}/`, data);
  }

  // UPDATE
  update(id: number, data: StatutFicheTechnique): Observable<StatutFicheTechnique> {
    return this.http.put<StatutFicheTechnique>(`${this.baseUrl}/${id}/`, data);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
