// src/app/rcv/endpoints/rcv-promesses.api.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {combineLatestWith, map, shareReplay, switchMap, tap} from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';

import { RecouvPromesseServices } from '../../shared/services/recouv-promesse.services';
import { ClientService } from '../../shared/services/client.service';
import { FactureService } from '../../shared/services/facture.service';

export type RcvPromesseStatut = 'EN_COURS' | 'RESPECTEE' | 'NON_RESPECTEE';

import { take } from 'rxjs/operators';

export interface RcvPromesseEnriched {
  id: number;
  client_id: number;
  facture_id: number | null;
  montant: number;
  date_promesse: string;
  statut: RcvPromesseStatut;
  created_at?: string;

  client?: any;
  facture?: any;
}

export interface RcvPromessesFilters {
  client_id?: number | null;
  facture_id?: number | null;
  statut?: RcvPromesseStatut | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RcvPromessesApi {
  private refreshPromesses$ = new BehaviorSubject<void>(undefined);
  private refreshRefs$ = new BehaviorSubject<void>(undefined);

  private promesses$ = this.refreshPromesses$.pipe(
    switchMap(() => this.promSrv.getItems() as Observable<any[]>),
    shareReplay(1)
  );

  private clients$!: Observable<any[]>;
  private factures$!: Observable<any[]>;

  constructor(
    private promSrv: RecouvPromesseServices,
    private clientSrv: ClientService,
    private factureSrv: FactureService
  ) {
    // ✅ refs chargés une seule fois (et rechargés uniquement via reloadRefs)
    this.clients$ = this.refreshRefs$.pipe(
      switchMap(() => this.clientSrv.getItems()),
      map((cs: any[]) => (cs || []).map(c => ({
        ...c,
        // aliases pour ne pas casser ton UI existante
        denomination: c.denomination ?? c.denomination_sociale,
        code: c.code ?? c.compte_comptable
      }))),
      shareReplay(1)
    );

    this.factures$ = this.refreshRefs$.pipe(
      switchMap(() => this.factureSrv.getListItems()),
      shareReplay(1)
    );
  }

  /** UI: recharge clients + factures */
  reloadRefs(): void {
    this.refreshRefs$.next();
  }

  /** interne: recharge promesses */
  private reloadPromesses(): void {
    this.refreshPromesses$.next();
  }

  list(q: PageQuery, filters?: RcvPromessesFilters): Observable<PageResult<RcvPromesseEnriched>> {
    return this.promesses$.pipe(
      combineLatestWith(this.clients$, this.factures$),
      map(([promesses, clients, factures]) => {
        const clientById = new Map<number, any>((clients || []).map(c => [c.id, c]));
        const factureById = new Map<number, any>((factures || []).map(f => [f.id, f]));


        let items: RcvPromesseEnriched[] = (promesses || []).map((p: any) => ({
          ...(p as any),
          montant: this.toNumber(p.montant), // ✅ conversion
          client: clientById.get(p.client_id),
          facture: p.facture_id ? factureById.get(p.facture_id) : null
        })) as any;

        // ---- Filters
        const f = filters ?? {};
        if (f.client_id != null) items = items.filter(x => x.client_id === f.client_id);
        if (f.facture_id != null) items = items.filter(x => x.facture_id === f.facture_id);
        if (f.statut) items = items.filter(x => x.statut === f.statut);
        if (f.dateFrom) items = items.filter(x => String(x.date_promesse) >= String(f.dateFrom));
        if (f.dateTo) items = items.filter(x => String(x.date_promesse) <= String(f.dateTo));

        // ---- Search
        if (q.search?.trim()) {
          const s = q.search.trim().toLowerCase();
          items = items.filter(x => {
            const c = x.client ?? {};
            const fa = x.facture ?? {};
            return (
              String(x.id).includes(s) ||
              String(x.client_id).includes(s) ||
              String(x.facture_id ?? '').includes(s) ||
              String(x.montant ?? '').includes(s) ||
              String(x.date_promesse ?? '').includes(s) ||
              String(c.code ?? '').toLowerCase().includes(s) ||
              String(c.denomination ?? '').toLowerCase().includes(s) ||
              String(fa.reference ?? '').toLowerCase().includes(s)
            );
          });
        }

        // ---- Sort
        const sort = q.sort?.trim() || 'date_promesse,asc';
        const [fieldRaw, dirRaw] = sort.split(',');
        const field = (fieldRaw || 'date_promesse').trim();
        const dir = (dirRaw || 'asc').toLowerCase() === 'desc' ? -1 : 1;

        const getField = (row: any, path: string) => {
          if (!path.includes('.')) return row?.[path];
          const [root, sub] = path.split('.');
          return row?.[root]?.[sub];
        };

        items.sort((a: any, b: any) => {
          const av = getField(a, field);
          const bv = getField(b, field);
          if (av == null && bv == null) return 0;
          if (av == null) return -1 * dir;
          if (bv == null) return 1 * dir;
          return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
        });

        // ---- Pagination
        const total = items.length;
        const pageSize = q.pageSize ?? 25;
        const page = q.page ?? 1;
        const start = (page - 1) * pageSize;

        return { items: items.slice(start, start + pageSize), page, pageSize, total };
      })
    );
  }

  private toNumber(v: any): number {
    if (v == null || v === '') return 0;
    if (typeof v === 'number') return v;
    // support "125 000", "125000", "125000.50"
    const s = String(v).replace(/\s/g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  getById(id: number): Observable<RcvPromesseEnriched> {
    return this.promSrv.getItem(id).pipe(
      combineLatestWith(this.clients$, this.factures$),
      map(([p, clients, factures]) => {
        const clientById = new Map<number, any>((clients || []).map(c => [c.id, c]));
        const factureById = new Map<number, any>((factures || []).map(f => [f.id, f]));
        return {
          ...(p as any),
          montant: this.toNumber((p as any).montant),  // si tu as déjà ajouté toNumber
          client: clientById.get((p as any).client_id),
          facture: (p as any).facture_id ? factureById.get((p as any).facture_id) : null
        } as any;
      }),
      take(1) // ✅ force complétion -> finalize côté UI marche
    );
  }

  create(dto: any): Observable<any> {
    return (this.promSrv.create(dto) as any).pipe(
      tap(() => this.reloadPromesses())
    );
  }

  update(id: number, patch: any): Observable<any> {
    return (this.promSrv.update(id, patch) as any).pipe(
      tap(() => this.reloadPromesses())
    );
  }

  delete(id: number): Observable<void> {
    return this.promSrv.delete(id).pipe(
      tap(() => this.reloadPromesses())
    );
  }
}
