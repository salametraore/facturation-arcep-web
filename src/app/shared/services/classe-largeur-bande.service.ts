// src/app/shared/services/classe-largeur-bande.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { BaseClasseService } from './base-classe.service';

import {
  ClasseLargeurBande,
  ClasseLargeurBandeRequest
} from '../models/classe-largeur-bande.model';

@Injectable({ providedIn: 'root' })
export class ClasseLargeurBandeService extends BaseClasseService<ClasseLargeurBande> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  /** Base normalisée: {baseUrl}/classe-largeur-bande-frequences */
  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-largeur-bande-frequences`;
  }

  // --------- CRUD (avec Request) ---------
  override create(payload: ClasseLargeurBandeRequest): Observable<ClasseLargeurBande> {
    return this.http.post<ClasseLargeurBande>(`${this.baseUrl}/`, payload);
  }

  override update(id: number, payload: ClasseLargeurBandeRequest): Observable<ClasseLargeurBande> {
    return this.http.put<ClasseLargeurBande>(`${this.baseUrl}/${id}/`, payload);
  }

  // getListItems/getItem/delete hérités (avec cache sur getListItems())

  // --------- Helper métier ---------
  getClasseIdByLargeurBande(largeurMhz: number | string | null | undefined): Observable<number | null> {
    const lb = this.toNumber(largeurMhz);
    if (lb == null) return of(null);

    return this.getListItems().pipe(
      map(items => {
        const actifs = (items ?? []).filter(x => x.actif !== false);
        return this.findBestClasseId(
          actifs,
          lb,
          x => this.toNumber(x.lb_min_mhz),
          x => this.toNumber(x.lb_max_mhz)
        );
      })
    );
  }
}
