// src/app/shared/services/classe-debit.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { BaseClasseService } from './base-classe.service';

import { ClasseDebit, ClasseDebitRequest } from '../models/classe-debit.model';

@Injectable({ providedIn: 'root' })
export class ClasseDebitService extends BaseClasseService<ClasseDebit> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  /** Base normalisée: {baseUrl}/classe-debit */
  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-debit`;
  }

  // --------- CRUD (avec Request) ---------
  override create(payload: ClasseDebitRequest): Observable<ClasseDebit> {
    return this.http.post<ClasseDebit>(`${this.baseUrl}/`, payload);
  }

  override update(id: number, payload: ClasseDebitRequest): Observable<ClasseDebit> {
    return this.http.put<ClasseDebit>(`${this.baseUrl}/${id}/`, payload);
  }

  // getListItems/getItem/delete hérités (getListItems est caché via shareReplay)

  // --------- Helper métier ---------
  getClasseIdByDebit(debitKbps: number | string | null | undefined): Observable<number | null> {
    const d = this.toNumber(debitKbps);
    if (d == null) return of(null);

    return this.getListItems().pipe(
      map(items =>
        this.findBestClasseId(
          items,
          d,
          x => (x.debit_min_kbps ?? null),
          x => (x.debit_max_kbps ?? null)
        )
      )
    );
  }
}
