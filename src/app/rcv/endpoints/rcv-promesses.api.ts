// src/app/recouvrement/rcv/endpoints/rcv-promesses.api.ts

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { RcvStoreService } from '../rcv-store.service';
import { PageQuery, PageResult } from '../rcv-query';

export type RcvPromesseStatut = 'EN_COURS' | 'RESPECTEE' | 'NON_RESPECTEE';

export interface RcvPromesse {
  id: number;
  client_id: number;
  facture_id: number | null;
  montant: number;
  date_promesse: string; // YYYY-MM-DD
  statut: RcvPromesseStatut;
  created_at?: string;
}

export interface RcvPromesseEnriched extends RcvPromesse {
  client?: any;
  facture?: any;
}

export interface RcvPromessesFilters {
  client_id?: number | null;
  facture_id?: number | null;
  statut?: RcvPromesseStatut | null;
  dateFrom?: string | null; // YYYY-MM-DD
  dateTo?: string | null;   // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class RcvPromessesApi {
  private COL = 'promesses';
  private CLIENTS = 'clients';
  private FACTURES = 'factures';

  constructor(private store: RcvStoreService) {}

  /**
   * Liste paginée (SYNC) - comme RcvGroupesApi.
   * Signature: list(q, filters?) pour matcher ton composant.
   */
  list(q: PageQuery, filters?: RcvPromessesFilters): PageResult<RcvPromesseEnriched> {
    const promesses = this.store.list<RcvPromesse>(this.COL);
    const clients = this.store.list<any>(this.CLIENTS);
    const factures = this.store.list<any>(this.FACTURES);

    const clientById = new Map<number, any>(clients.map(c => [c.id, c]));
    const factureById = new Map<number, any>(factures.map(f => [f.id, f]));

    let items: RcvPromesseEnriched[] = promesses.map(p => ({
      ...p,
      client: clientById.get(p.client_id),
      facture: p.facture_id ? factureById.get(p.facture_id) : null
    }));

    // ---- Filters
    const f = filters ?? {};
    if (f.client_id != null && f.client_id !== ('' as any)) {
      items = items.filter(x => x.client_id === f.client_id);
    }
    if (f.facture_id != null && f.facture_id !== ('' as any)) {
      items = items.filter(x => x.facture_id === f.facture_id);
    }
    if (f.statut) {
      items = items.filter(x => x.statut === f.statut);
    }
    if (f.dateFrom) {
      items = items.filter(x => String(x.date_promesse) >= String(f.dateFrom));
    }
    if (f.dateTo) {
      items = items.filter(x => String(x.date_promesse) <= String(f.dateTo));
    }

    // ---- Search (client, facture, montant, date, id)
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
          String(c.denomination ?? c.denomination_sociale ?? '').toLowerCase().includes(s) ||
          String(fa.reference ?? '').toLowerCase().includes(s)
        );
      });
    }

    // ---- Sort (supporte "client.denomination", "facture.reference")
    const sort = q.sort?.trim() || 'date_promesse,asc';
    const [fieldRaw, dirRaw] = sort.split(',');
    const field = (fieldRaw || 'date_promesse').trim();
    const dir = (dirRaw || 'asc').trim().toLowerCase() === 'desc' ? -1 : 1;

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
  }

  /**
   * Observable pour ton dialog (pipe/finalize/subscribe)
   */
  getById(id: number): Observable<RcvPromesseEnriched> {
    const p = this.store.getById<RcvPromesse>(this.COL, id);
    if (!p) return throwError(() => new Error(`Promesse ${id} introuvable`));

    const client = this.store.list<any>(this.CLIENTS).find(c => c.id === p.client_id);
    const facture = p.facture_id
      ? this.store.list<any>(this.FACTURES).find(f => f.id === p.facture_id)
      : null;

    return of({ ...p, client, facture });
  }

  create(dto: Partial<RcvPromesse>): Observable<RcvPromesseEnriched> {
    const created = this.store.create<RcvPromesse>(this.COL, dto as any);
    return this.getById(created.id);
  }

  update(id: number, patch: Partial<RcvPromesse>): Observable<RcvPromesseEnriched> {
    this.store.update<RcvPromesse>(this.COL, id, patch);
    return this.getById(id);
  }

  delete(id: number): Observable<void> {
    this.store.delete(this.COL, id);
    return of(void 0);
  }
}
