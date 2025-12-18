import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';
import { ClasseDebit } from '../models/fiche-technique-frequence-parametres';
import { BaseClasseService } from './base-classe.service';

@Injectable({ providedIn: 'root' })
export class ClasseDebitService extends BaseClasseService<ClasseDebit> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-debit`;
  }

  getClasseIdByDebit(debitKbps: number | string | null | undefined): Observable<number | null> {
    const d = this.toNumber(debitKbps);
    if (d == null) return of(null);

    return this.getListItems().pipe(
      map(items =>
        this.findBestClasseId(
          items,
          d,
          x => (x.debit_min_kbps ?? null), // number
          x => (x.debit_max_kbps ?? null)
        )
      )
    );
  }
}
