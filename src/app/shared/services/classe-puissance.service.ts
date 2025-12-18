import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';
import { ClassePuissance } from '../models/fiche-technique-frequence-parametres';
import { BaseClasseService } from './base-classe.service';

@Injectable({ providedIn: 'root' })
export class ClassePuissanceService extends BaseClasseService<ClassePuissance> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-puissance`;
  }

  getClasseIdByPuissance(puissanceW: number | string | null | undefined): Observable<number | null> {
    const p = this.toNumber(puissanceW);
    if (p == null) return of(null);

    return this.getListItems().pipe(
      map(items =>
        this.findBestClasseId(
          items,
          p,
          x => this.toNumber(x.p_min_w),   // string decimal
          x => this.toNumber(x.p_max_w)
        )
      )
    );
  }
}
