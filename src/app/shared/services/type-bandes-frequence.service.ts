import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeBandeFrequenceList } from '../models/typeBandeFrequenceList';
import { AppConfigService } from '../../core/config/app-config.service';
import {TypeBandeFrequenceDetail} from "../models/typeBandeFrequenceDetail";

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

  create(typeBandeFrequenceList: TypeBandeFrequenceDetail): Observable<TypeBandeFrequenceDetail> {
    return this.http.post<TypeBandeFrequenceDetail>(`${this.baseUrl}/`, typeBandeFrequenceList);
  }

  getListItems(): Observable<TypeBandeFrequenceList[]> {
    return this.http.get<TypeBandeFrequenceList[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<TypeBandeFrequenceDetail> {
    return this.http.get<TypeBandeFrequenceDetail>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, typeBandeFrequenceList: TypeBandeFrequenceDetail): Observable<TypeBandeFrequenceDetail> {
    return this.http.put<TypeBandeFrequenceDetail>(`${this.baseUrl}/${id}/`, typeBandeFrequenceList);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
