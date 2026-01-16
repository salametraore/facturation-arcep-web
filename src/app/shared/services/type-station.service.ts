import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TypeStation, TypeStationRequest} from '../models/type-station';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class TypeStationService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/type-station */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/type-stations`;
  }

  getItem(id: number): Observable<TypeStation> {
    return this.http.get<TypeStation>(`${this.baseUrl}/${id}/`);
  }

  create(data: TypeStationRequest): Observable<TypeStation> {
    return this.http.post<TypeStation>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: TypeStationRequest): Observable<TypeStation> {
    return this.http.put<TypeStation>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<TypeStation[]> {
    return this.http.get<TypeStation[]>(`${this.baseUrl}/`);
  }
}
