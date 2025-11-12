import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FicheTechniquesProduits } from '../models/ficheTechniquesProduits';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class FicheTechniquesProduitsService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Normalise les segments d’URL pour éviter les // */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,''))
      .join('/');
  }

  private get baseUrl(): string {
    return this.joinUrl(this.cfg.baseUrl, 'fiche-techniques-produits');
  }

  getItem(id: number): Observable<FicheTechniquesProduits> {
    return this.http.get<FicheTechniquesProduits>(`${this.baseUrl}/${id}`);
  }

  create(data: FicheTechniquesProduits): Observable<FicheTechniquesProduits> {
    return this.http.post<FicheTechniquesProduits>(`${this.baseUrl}`, data);
  }

  update(id: number, value: FicheTechniquesProduits): Observable<FicheTechniquesProduits> {
    return this.http.put<FicheTechniquesProduits>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getListItems(): Observable<FicheTechniquesProduits[]> {
    return this.http.get<FicheTechniquesProduits[]>(`${this.baseUrl}/`);
  }
}
