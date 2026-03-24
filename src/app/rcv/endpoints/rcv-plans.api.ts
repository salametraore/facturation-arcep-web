import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, shareReplay, switchMap, tap, catchError, take } from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';
import { applyPageQuery } from '../apply-page-query';

import { RecouvPlanActionServices } from '../../shared/services/recouv-plan-action.services';
import { RecouvPlanEtapeServices } from '../../shared/services/recouv-plan-etape.services';

@Injectable({ providedIn: 'root' })
export class RcvPlansApi {
  private refreshPlans$ = new BehaviorSubject<void>(undefined);
  private refreshEtapes$ = new BehaviorSubject<void>(undefined);

  private plans$ = this.refreshPlans$.pipe(
    switchMap(() => this.planSrv.getItems()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private etapes$ = this.refreshEtapes$.pipe(
    switchMap(() => this.etapeSrv.getItems()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private planSrv: RecouvPlanActionServices,
    private etapeSrv: RecouvPlanEtapeServices
  ) {}

  list(q: PageQuery): Observable<PageResult<any>> {
    return this.plans$.pipe(
      map(all =>
        applyPageQuery(
          all || [],
          q,
          ['code', 'nom'],
          (p, f) => {
            if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
              if ((p as any).actif !== f['actif']) return false;
            }
            return true;
          }
        )
      )
    );
  }

  get(id: number): Observable<any> {
    return this.planSrv.getItem(id);
  }

  create(dto: any): Observable<any> {
    return this.planSrv.create(dto).pipe(
      tap(() => this.refreshPlans$.next())
    );
  }

  update(id: number, dto: any): Observable<any> {
    return this.planSrv.update(id, dto).pipe(
      tap(() => this.refreshPlans$.next())
    );
  }

  delete(id: number): Observable<void> {
    return this.planSrv.delete(id).pipe(
      tap(() => this.refreshPlans$.next())
    );
  }

  listEtapes(planId: number): Observable<any[]> {
    return this.etapes$.pipe(
      map(all =>
        (all || [])
          .filter(e => Number(e.plan_action) === Number(planId))
          .sort((a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0))
      )
    );
  }

  addEtape(planId: number, dto: any): Observable<any> {
    return this.listEtapes(planId).pipe(
      take(1),
      switchMap(existing => {
        const ordre = dto.ordre ?? (
          existing.length
            ? Math.max(...existing.map(x => x.ordre ?? 0)) + 1
            : 1
        );

        return this.etapeSrv.create({
          ...dto,
          plan_action: planId,
          ordre
        }).pipe(
          tap(() => this.refreshEtapes$.next())
        );
      })
    );
  }

  updateEtape(etapeId: number, patch: any): Observable<any> {
    return this.etapeSrv.update(etapeId, patch).pipe(
      tap(() => this.refreshEtapes$.next())
    );
  }

  deleteEtape(etapeId: number): Observable<void> {
    return this.etapeSrv.delete(etapeId).pipe(
      tap(() => this.refreshEtapes$.next())
    );
  }

  reorder(planId: number, orderedIds: number[]): Observable<any> {
    const calls = orderedIds.map((id, idx) =>
      this.etapeSrv.patch(id, { ordre: idx + 1, plan_action: planId } as any).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(calls).pipe(
      tap(() => this.refreshEtapes$.next())
    );
  }
}
