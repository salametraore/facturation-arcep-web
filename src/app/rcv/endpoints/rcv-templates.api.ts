import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';
import { applyPageQuery } from '../apply-page-query';

import { RecouvTemplateServices } from '../../shared/services/recouv-template.services';

type CanalSeed = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';
type CanalUi = 'EMAIL' | 'SMS' | 'APPEL' | 'COURRIER' | null;

@Injectable({ providedIn: 'root' })
export class RcvTemplatesApi {
  private refresh$ = new BehaviorSubject<void>(undefined);

  private templates$ = this.refresh$.pipe(
    switchMap(() => this.srv.getItems()),   // backend -> tableau
    shareReplay(1)
  );

  constructor(private srv: RecouvTemplateServices) {}

  /** UI -> seed (COURRIER => LETTRE) */
  toSeedCanal(ui: CanalUi): CanalSeed | null {
    if (!ui) return null;
    return ui === 'COURRIER' ? 'LETTRE' : (ui as any);
  }

  /** LIST (paging/tri/recherche local) */
  list(q: PageQuery): Observable<PageResult<any>> {
    return this.templates$.pipe(
      map(all =>
        applyPageQuery(
          all || [],
          q,
          ['nom', 'code', 'canal', 'sujet', 'contenu'],
          (t, f) => {
            // filtre actif
            if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
              if ((t as any).actif !== f['actif']) return false;
            }
            // filtre canal (seed)
            if (f['canal'] !== null && f['canal'] !== undefined && f['canal'] !== '') {
              const tc = String((t as any).canal || '').toUpperCase();
              const fc = String(f['canal'] || '').toUpperCase();
              if (tc !== fc) return false;
            }
            return true;
          }
        )
      )
    );
  }

  /** READ */
  get(id: number): Observable<any> {
    return this.srv.getItem(id);
  }

  /** CREATE */
  create(dto: any): Observable<any> {
    return this.srv.create(dto).pipe(tap(() => this.refresh$.next()));
  }

  /** UPDATE */
  update(id: number, dto: any): Observable<any> {
    return this.srv.update(id, dto).pipe(tap(() => this.refresh$.next()));
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.srv.delete(id).pipe(tap(() => this.refresh$.next()));
  }
}
