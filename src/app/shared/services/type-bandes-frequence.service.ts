import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';
import {TypeBandeFrequence,TypeBandeFrequenceRequest} from "../models/typeBandeFrequenceDetail";

@Injectable({ providedIn: 'root' })
export class TypeBandesFrequenceService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/type-bandes-frequence */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/type-bandes-frequence`;
  }

  create(typeBandeFrequenceRequest: TypeBandeFrequenceRequest): Observable<TypeBandeFrequence> {
    return this.http.post<TypeBandeFrequence>(`${this.baseUrl}/`, typeBandeFrequenceRequest);
  }

  getListItems(): Observable<TypeBandeFrequence[]> {
    return this.http.get<TypeBandeFrequence[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<TypeBandeFrequence> {
    return this.http.get<TypeBandeFrequence>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, typeBandeFrequenceRequest: TypeBandeFrequenceRequest): Observable<TypeBandeFrequence> {
    return this.http.put<TypeBandeFrequence>(`${this.baseUrl}/${id}/`, typeBandeFrequenceRequest);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
