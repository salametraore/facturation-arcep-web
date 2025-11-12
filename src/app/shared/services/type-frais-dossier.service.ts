import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TarifFraisDossierList } from '../models/tarifFraisDossierList';
import { TarifFraisDossierDetail } from '../models/tarifFraisDossierDetail';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class TypeFraisService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/tarifs-frais-dossier */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/tarifs-frais-dossier`;
  }

  getItem(id: number): Observable<TarifFraisDossierDetail> {
    return this.http.get<TarifFraisDossierDetail>(`${this.baseUrl}/${id}/`);
  }

  create(data: TarifFraisDossierDetail): Observable<TarifFraisDossierDetail> {
    return this.http.post<TarifFraisDossierDetail>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TarifFraisDossierDetail): Observable<TarifFraisDossierDetail> {
    return this.http.put<TarifFraisDossierDetail>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TarifFraisDossierList[]> {
    return this.http.get<TarifFraisDossierList[]>(`${this.baseUrl}/`);
  }
}
