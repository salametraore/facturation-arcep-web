import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from 'src/app/shared/models/produit';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ProduitService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/produits */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    return `${base}/produits`;
  }

  getItem(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/${id}/`);
  }

  create(data: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/`);
  }

  getListeProduitsByDirection(directionId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/direction/${directionId}/`);
  }
}
