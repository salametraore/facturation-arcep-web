import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategorieProduit } from '../models/categorie-produit';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class CategorieProduitService {

  /** segment d’API (toujours sans slash de début/fin) */
  private readonly resource = 'categories-produits';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée: {baseUrl}/{resource} (sans doubles slash) */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');          // retire slash final s'il existe
    const res  = this.resource.replace(/^\/|\/$/g, '');        // retire slashes début/fin
    return `${base}/${res}`;
  }

  create(categorie: CategorieProduit): Observable<CategorieProduit> {
    return this.http.post<CategorieProduit>(`${this.baseUrl}/`, categorie);
  }

  getListItems(): Observable<CategorieProduit[]> {
    return this.http.get<CategorieProduit[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<CategorieProduit> {
    return this.http.get<CategorieProduit>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, categorie: CategorieProduit): Observable<CategorieProduit> {
    return this.http.put<CategorieProduit>(`${this.baseUrl}/${id}/`, categorie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
