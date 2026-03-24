import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';
import { applyPageQuery } from '../apply-page-query';

import { RecouvDeclencheurServices } from '../../shared/services/recouv-declencheur.services';
import { RecouvDeclencheur as BackendDeclencheur } from '../../shared/models/recouv-declencheur';
import {
  RcvDeclencheur,
  RcvDeclencheurCriteres
} from '../../recouvrement/models/rcv-declencheur.models';

@Injectable({ providedIn: 'root' })
export class RcvDeclencheursApi {
  private refresh$ = new BehaviorSubject<void>(undefined);

  private declencheurs$ = this.refresh$.pipe(
    switchMap(() => this.srv.getItems()),
    shareReplay(1)
  );

  constructor(private srv: RecouvDeclencheurServices) {}

  reload(): void {
    this.refresh$.next();
  }

  list(q: PageQuery): Observable<PageResult<RcvDeclencheur>> {
    return this.declencheurs$.pipe(
      map((all: BackendDeclencheur[] | any) => {
        const items: any[] = Array.isArray(all) ? all : (all?.results ?? []);
        return items.map(d => this.normalizeDeclencheur(d));
      }),
      map((all: RcvDeclencheur[]) =>
        applyPageQuery(
          all,
          q,
          ['code', 'nom', 'description'],
          (d, f) => {
            if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
              if (d.actif !== f['actif']) return false;
            }

            if (f['groupe_id'] !== null && f['groupe_id'] !== undefined && f['groupe_id'] !== '') {
              if (d.groupe_id !== this.toNumber(f['groupe_id'])) return false;
            }

            if (f['criteres.jours_avant_echeance_min'] === 'NOT_NULL') {
              const v = d.criteres?.jours_avant_echeance_min;
              if (v === null || v === undefined) return false;
            }

            if (f['criteres.jours_apres_echeance_min'] === 'NOT_NULL') {
              const v = d.criteres?.jours_apres_echeance_min;
              if (v === null || v === undefined) return false;
            }

            return true;
          }
        )
      )
    );
  }

  get(id: number): Observable<RcvDeclencheur> {
    return this.srv.getItem(id).pipe(
      map((item: BackendDeclencheur | any) => this.normalizeDeclencheur(item))
    );
  }

  create(dto: any): Observable<any> {
    return this.srv.create(dto).pipe(tap(() => this.refresh$.next()));
  }

  update(id: number, dto: any): Observable<any> {
    return this.srv.update(id, dto).pipe(tap(() => this.refresh$.next()));
  }

  delete(id: number): Observable<void> {
    return this.srv.delete(id).pipe(tap(() => this.refresh$.next()));
  }

  private normalizeDeclencheur(dto: BackendDeclencheur | any): RcvDeclencheur {
    const nbJours = this.toNumber(dto?.nb_jours);

    let joursAvant: number | null = null;
    let joursApres: number | null = null;

    if (dto?.type_delai === 'AVANT_ECHEANCE') {
      joursAvant = nbJours;
    } else if (dto?.type_delai === 'APRES_ECHEANCE') {
      joursApres = nbJours;
    }

    const criteres: RcvDeclencheurCriteres = {
      type_client: this.toStringArray(dto?.type_client),
      produit_code: this.toStringArray(dto?.type_produit_service),
      montant_min: this.toNumber(dto?.montant_min),
      montant_max: this.toNumber(dto?.montant_max),
      nb_factures_impayees_min: this.toNumber(dto?.nb_factures_impayees_min),
      jours_avant_echeance_min: joursAvant,
      jours_apres_echeance_min: joursApres
    };

    return {
      id: Number(dto?.id),
      code: String(dto?.code ?? ''),
      nom: String(dto?.nom ?? ''),
      description: dto?.description ?? null,
      actif: dto?.actif ?? true,

      groupe_id: this.toNumber(dto?.groupe ?? dto?.groupe_detail?.id) ?? 0,
      groupe_label: dto?.groupe_detail?.nom ?? null,
      plan_action_id: this.toNumber(dto?.plan_action ?? dto?.plan_action_detail?.id),

      criteres
    };
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private toStringArray(value: any): string[] {
    if (value === null || value === undefined || value === '') return [];

    if (Array.isArray(value)) {
      return value
        .map(v => String(v ?? '').trim())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return [];

      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed
              .map(v => String(v ?? '').trim())
              .filter(Boolean);
          }
        } catch {
          // fallback vers split simple
        }
      }

      return s
        .split(/[,;|]/)
        .map(x => x.trim())
        .filter(Boolean);
    }

    return [];
  }
}
