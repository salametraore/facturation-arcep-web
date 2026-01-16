// src/app/shared/services/classe-puissance.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { BaseClasseService } from './base-classe.service';

import {
  ClassePuissance,
  ClassePuissanceRequest
} from '../models/classe-puissance.model';

@Injectable({ providedIn: 'root' })
export class ClassePuissanceService extends BaseClasseService<ClassePuissance> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  /** Base normalisée: {baseUrl}/classe-puissance */
  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-puissance`;
  }

  // --------- CRUD (avec Request) ---------
  override create(payload: ClassePuissanceRequest): Observable<ClassePuissance> {
    return this.http.post<ClassePuissance>(`${this.baseUrl}/`, payload);
  }

  override update(id: number, payload: ClassePuissanceRequest): Observable<ClassePuissance> {
    return this.http.put<ClassePuissance>(`${this.baseUrl}/${id}/`, payload);
  }

  // --------- Helper métier ---------
  getClasseIdByPuissance(puissanceW: number | string | null | undefined): Observable<number | null> {
    const p = this.toNumber(puissanceW);
    if (p == null) return of(null);

    return this.getListItems().pipe(
      map(items =>
        this.findBestClasseId(
          items,
          p,
          x => this.toNumber(x.p_min_w),   // p_min_w peut être string/number selon ton modèle
          x => this.toNumber(x.p_max_w)
        )
      )
    );
  }
}
