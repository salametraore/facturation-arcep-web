import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';
import { applyPageQuery } from '../apply-page-query';

import { RecouvDeclencheurServices } from '../../shared/services/recouv-declencheur.services';

@Injectable({ providedIn: 'root' })
export class RcvDeclencheursApi {
  private refresh$ = new BehaviorSubject<void>(undefined);

  private declencheurs$ = this.refresh$.pipe(
    switchMap(() => this.srv.getItems()),  // backend -> tableau
    shareReplay(1)
  );

  constructor(private srv: RecouvDeclencheurServices) {}

  list(q: PageQuery): Observable<PageResult<any>> {
    return this.declencheurs$.pipe(
      map(all =>
        applyPageQuery(
          all || [],
          q,
          ['code', 'nom', 'description'],
          (d, f) => {
            // filtre actif
            if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
              if ((d as any).actif !== f['actif']) return false;
            }

            // filtre groupe_id (si présent)
            if (f['groupe_id'] !== null && f['groupe_id'] !== undefined && f['groupe_id'] !== '') {
              if ((d as any).groupe_id !== f['groupe_id']) return false;
            }

            // filtre "délai" via flags NOT_NULL (logique UI actuelle)
            if (f['criteres.jours_avant_echeance_min'] === 'NOT_NULL') {
              const v = (d as any)?.criteres?.jours_avant_echeance_min;
              if (v === null || v === undefined) return false;
            }
            if (f['criteres.jours_apres_echeance_min'] === 'NOT_NULL') {
              const v = (d as any)?.criteres?.jours_apres_echeance_min;
              if (v === null || v === undefined) return false;
            }

            return true;
          }
        )
      )
    );
  }

  get(id: number): Observable<any> {
    return this.srv.getItem(id);
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
}
