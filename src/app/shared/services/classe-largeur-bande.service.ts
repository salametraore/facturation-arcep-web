import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AppConfigService } from '../../core/config/app-config.service';
import { ClasseLargeurBande } from '../models/fiche-technique-frequence-parametres';
import { BaseClasseService } from './base-classe.service';

@Injectable({ providedIn: 'root' })
export class ClasseLargeurBandeService extends BaseClasseService<ClasseLargeurBande> {

  constructor(
    http: HttpClient,
    private cfg: AppConfigService
  ) {
    super(http);
  }

  protected get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/classe-largeur-bande-frequences`;
  }

  getClasseIdByLargeurBande(largeurMhz: number | string | null | undefined): Observable<number | null> {
    const lb = this.toNumber(largeurMhz);
    if (lb == null) return of(null);

    return this.getListItems().pipe(
      map(items => {
        const actifs = (items ?? []).filter(x => x.actif !== false);
        return this.findBestClasseId(
          actifs,
          lb,
          x => this.toNumber(x.lb_min_mhz), // string decimal
          x => this.toNumber(x.lb_max_mhz)
        );
      })
    );
  }
}
