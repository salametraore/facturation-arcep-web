// src/app/shared/services/caractere-radio.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { CaractereRadio, CaractereRadioRequest } from '../models/caractere-radio.model';

@Injectable({ providedIn: 'root' })
export class CaractereRadioService {

  private readonly resource = 'caracteres-radio';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    const res  = this.resource.replace(/^\/|\/$/g, '');
    return `${base}/${res}`;
  }

  getItem(id: number): Observable<CaractereRadio> {
    return this.http.get<CaractereRadio>(`${this.baseUrl}/${id}`);
  }

  create(data: CaractereRadioRequest): Observable<CaractereRadio> {
    return this.http.post<CaractereRadio>(`${this.baseUrl}`, data);
  }

  update(id: number, value: CaractereRadioRequest): Observable<CaractereRadio> {
    return this.http.put<CaractereRadio>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  getListItems(): Observable<CaractereRadio[]> {
    return this.http.get<CaractereRadio[]>(`${this.baseUrl}/`);
  }
}
