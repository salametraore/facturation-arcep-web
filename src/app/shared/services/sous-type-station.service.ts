import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';
import { SousTypeStation } from '../models/sous-type-station';


@Injectable({ providedIn: 'root' })
export class SousTypeStationService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/sous-type-stations */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/sous-types-station`;
  }

  getItem(id: number): Observable<SousTypeStation> {
    return this.http.get<SousTypeStation>(`${this.baseUrl}/${id}/`);
  }

  create(data: SousTypeStation): Observable<SousTypeStation> {
    return this.http.post<SousTypeStation>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: SousTypeStation): Observable<SousTypeStation> {
    return this.http.put<SousTypeStation>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<SousTypeStation[]> {
    return this.http.get<SousTypeStation[]>(`${this.baseUrl}/`);
  }


}
