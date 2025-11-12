import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModePaiement } from '../models/mode-paiement';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ModePaiementService {

  constructor(
    private httpClient: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Normalise l’URL de base: {baseUrl}/modes-paiement */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    return `${base}/modes-paiement`;
  }

  getItems(): Observable<ModePaiement[]> {
    return this.httpClient.get<ModePaiement[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<ModePaiement> {
    return this.httpClient.get<ModePaiement>(`${this.baseUrl}/${id}/`);
  }

  create(modePaiement: ModePaiement): Observable<ModePaiement> {
    return this.httpClient.post<ModePaiement>(`${this.baseUrl}/`, modePaiement);
  }

  update(id: number, modePaiement: ModePaiement): Observable<ModePaiement> {
    return this.httpClient.put<ModePaiement>(`${this.baseUrl}/${id}/`, modePaiement);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
