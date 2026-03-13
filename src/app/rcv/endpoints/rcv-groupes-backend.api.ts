// src/app/rcv/endpoints/rcv-groupes-backend.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, map, shareReplay, tap, catchError } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import { PageQuery, PageResult } from '../rcv-query';

type Canal = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';

type ApiListResponse<T> = { count: number; results: T[] } | T[];

function normalizeList<T>(resp: ApiListResponse<T>): { count: number; results: T[] } {
  if (Array.isArray(resp)) return { count: resp.length, results: resp };
  return { count: resp.count ?? 0, results: resp.results ?? [] };
}

function applyPageQuery<T>(items: T[], q: PageQuery, searchableFields: string[] = []): PageResult<T> {
  let out = [...(items || [])];

  // search
  if (q.search?.trim() && searchableFields.length) {
    const s = q.search.trim().toLowerCase();
    out = out.filter((row: any) =>
      searchableFields.some((f) => String(getPath(row, f) ?? '').toLowerCase().includes(s))
    );
  }

  // sort "field,dir"
  if (q.sort?.trim()) {
    const [fieldRaw, dirRaw] = q.sort.split(',');
    const field = (fieldRaw || '').trim();
    const dir = (dirRaw || 'asc').trim().toLowerCase() === 'desc' ? -1 : 1;

    out.sort((a: any, b: any) => {
      const av = getPath(a, field);
      const bv = getPath(b, field);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      return (String(av).localeCompare(String(bv))) * dir;
    });
  }

  // pagination
  const total = out.length;
  const pageSize = q.pageSize ?? 25;
  const page = q.page ?? 1;
  const start = (page - 1) * pageSize;

  return { items: out.slice(start, start + pageSize), page, pageSize, total };
}

function getPath(obj: any, path: string): any {
  if (!path) return undefined;
  if (!path.includes('.')) return obj?.[path];
  return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

@Injectable({ providedIn: 'root' })
export class RcvGroupesBackendApi {
  private baseUrl(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  // ====== URLs (AJUSTE si besoin) ======
  private urlGroupes = () => `${this.baseUrl()}/recouvrement/groupes`;
  private urlMembres = () => `${this.baseUrl()}/recouvrement/groupes-membres`;
  private urlDeclencheurs = () => `${this.baseUrl()}/recouvrement/declencheurs`;

  // ⚠️ A AJUSTER selon ton projet si ce n’est pas dans /recouvrement
  private urlClients = () => `${this.baseUrl()}/clients`;
  private urlFactures = () => `${this.baseUrl()}/factures`;

  // ====== caches simples (temporaire) ======
  private groupesAll$?: Observable<any[]>;
  private clientsAll$?: Observable<any[]>;
  private facturesAll$?: Observable<any[]>;
  private declencheursAll$?: Observable<any[]>;

  private groupeCache = new Map<number, any>(); // pour get(id) sync

  constructor(private http: HttpClient, private cfg: AppConfigService) {}

  // -----------------------
  // GROUPES (mêmes méthodes que le fake)
  // -----------------------
  list(q: PageQuery): Observable<PageResult<any>> {
    return this.getGroupesAll().pipe(
      map((rows) => {
        // filtres (actif/type_groupe) comme ton écran
        const f = q.filters || {};
        let items = [...rows];

        if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
          items = items.filter(x => !!x.actif === !!f['actif']);
        }
        if (f['type_groupe']) {
          items = items.filter(x => String(x.type_groupe) === String(f['type_groupe']));
        }

        // search+sort+page
        const res = applyPageQuery(items, q, ['code', 'nom', 'description']);
        // alimente cache get()
        res.items.forEach((g: any) => this.groupeCache.set(Number(g.id), g));
        return res;
      })
    );
  }

  // ⚠️ signature identique au fake: get(id) synchro
  // => retourne depuis cache si possible (sinon null). Pour le dialog sans modification.
  get(id: number) {
    return this.groupeCache.get(Number(id)) ?? null;
  }

  create(dto: any) {
    // fire-and-forget pour éviter de modifier tes composants (pas de subscribe côté UI)
    this.http.post<any>(`${this.urlGroupes()}/`, dto).subscribe({
      next: () => this.invalidateGroupes(),
      error: (e) => console.error('create groupe failed', e),
    });
    return null;
  }

  update(id: number, patch: any) {
    this.http.patch<any>(`${this.urlGroupes()}/${id}/`, patch).subscribe({
      next: () => this.invalidateGroupes(id),
      error: (e) => console.error('update groupe failed', e),
    });
    return null;
  }

  delete(id: number) {
    this.http.delete<void>(`${this.urlGroupes()}/${id}/`).subscribe({
      next: () => this.invalidateGroupes(id),
      error: (e) => console.error('delete groupe failed', e),
    });
  }

  // -----------------------
  // MEMBRES (MANUEL) — multi-calls
  // -----------------------
  listMembres(groupeId: number, q: PageQuery): Observable<PageResult<any>> {
    // 1) récup membres du groupe (si API supporte groupe_id, on essaie; sinon on filtre)
    let params = new HttpParams().set('groupe_id', String(groupeId));
    return forkJoin({
      membres: this.http.get<ApiListResponse<any>>(`${this.urlMembres()}/`, { params }).pipe(
        map(normalizeList),
        map(r => r.results),
        catchError(() =>
          // fallback: get all then filter
          this.http.get<ApiListResponse<any>>(`${this.urlMembres()}/`).pipe(
            map(normalizeList),
            map(r => r.results.filter(m => Number(m.groupe_id) === Number(groupeId)))
          )
        )
      ),
      clients: this.getClientsAll()
    }).pipe(
      map(({ membres, clients }) => {
        const clientById = new Map<number, any>(clients.map(c => [Number(c.id), c]));
        let items = membres.map(m => ({ ...m, client: clientById.get(Number(m.client_id)) || null }));

        // filtres: exclu
        if (q.filters?.['exclu'] !== undefined && q.filters['exclu'] !== null && q.filters['exclu'] !== '') {
          items = items.filter(x => !!x.exclu === !!q.filters!['exclu']);
        }

        // search sur client
        const res = applyPageQuery(items, q, ['client.code', 'client.denomination', 'client.denomination_sociale']);
        return res;
      })
    );
  }

  addMembre(groupeId: number, clientId: number) {
    // tentative: éviter doublon via un call léger (optionnel)
    const payload = { groupe_id: groupeId, client_id: clientId, exclu: false, motif_override: null };

    this.http.post<any>(`${this.urlMembres()}/`, payload).subscribe({
      next: () => { /* rien */ },
      error: (e) => console.error('addMembre failed', e),
    });
    return null;
  }

  toggleExclu(membreId: number, exclu: boolean, motif?: string) {
    const payload = { exclu, motif_override: exclu ? (motif || 'Exclusion manuelle') : null };
    this.http.patch<any>(`${this.urlMembres()}/${membreId}/`, payload).subscribe({
      next: () => { /* rien */ },
      error: (e) => console.error('toggleExclu failed', e),
    });
    return null;
  }

  removeMembre(membreId: number) {
    this.http.delete<void>(`${this.urlMembres()}/${membreId}/`).subscribe({
      next: () => { /* rien */ },
      error: (e) => console.error('removeMembre failed', e),
    });
  }

  // -----------------------
  // PREVIEW DYNAMIQUE — multi-calls (temporaire)
  // -----------------------
  previewDynMembers(groupeId: number, q: PageQuery): Observable<PageResult<any>> {
    return forkJoin({
      declencheurs: this.getDeclencheursAll().pipe(
        map(ds => ds.filter(d => Number(d.groupe_id) === Number(groupeId) && !!d.actif))
      ),
      clients: this.getClientsAll(),
      factures: this.getFacturesAll()
    }).pipe(
      map(({ declencheurs, clients, factures }) => {
        const clientById = new Map<number, any>(clients.map(c => [Number(c.id), c]));
        const today = new Date();
        const daysLate = (dateIso: string) =>
          Math.floor((today.getTime() - new Date(dateIso).getTime()) / 86400000);

        const eligibleFactures: any[] = [];

        for (const d of declencheurs) {
          const crit = d.criteres || {};
          let items = (factures || []).filter((f: any) =>
            (String(f.statut) === 'IMPAYE' || String(f.statut) === 'PARTIELLE') &&
            Number(f.montant_restant ?? 0) > 0
          );

          if (crit.montant_min != null) items = items.filter(f => Number(f.montant_restant ?? 0) >= Number(crit.montant_min));
          if (Array.isArray(crit.produit_code) && crit.produit_code.length) items = items.filter(f => crit.produit_code.includes(f.produit_code));
          if (Array.isArray(crit.type_client) && crit.type_client.length) items = items.filter(f => crit.type_client.includes(clientById.get(Number(f.client_id))?.type_client));
          if (crit.jours_apres_echeance_min != null) items = items.filter(f => daysLate(f.date_echeance) >= Number(crit.jours_apres_echeance_min));

          eligibleFactures.push(...items);
        }

        const agg = new Map<number, { client: any; nb_factures: number; montant_total: number }>();
        for (const f of eligibleFactures) {
          const cid = Number(f.client_id);
          const c = clientById.get(cid);
          if (!c) continue;

          const a = agg.get(cid) ?? { client: c, nb_factures: 0, montant_total: 0 };
          a.nb_factures += 1;
          a.montant_total += Number(f.montant_restant ?? 0);
          agg.set(cid, a);
        }

        const items = Array.from(agg.values());
        return applyPageQuery(items, q, ['client.code', 'client.denomination', 'client.denomination_sociale']);
      })
    );
  }

  previewDynClientFactures(groupeId: number, clientId: number, q: PageQuery): Observable<PageResult<any>> {
    return forkJoin({
      declencheurs: this.getDeclencheursAll().pipe(
        map(ds => ds.filter(d => Number(d.groupe_id) === Number(groupeId) && !!d.actif))
      ),
      clients: this.getClientsAll(),
      factures: this.getFacturesAll()
    }).pipe(
      map(({ declencheurs, clients, factures }) => {
        const client = (clients || []).find(c => Number(c.id) === Number(clientId));
        if (!client) return { items: [], page: 1, pageSize: q.pageSize ?? 25, total: 0 };

        const today = new Date();
        const daysLate = (iso: string) =>
          Math.floor((today.getTime() - new Date(iso).getTime()) / 86400000);

        const base = (factures || []).filter((f: any) =>
          Number(f.client_id) === Number(clientId) &&
          (String(f.statut) === 'IMPAYE' || String(f.statut) === 'PARTIELLE') &&
          Number(f.montant_restant ?? 0) > 0
        );

        const eligible = new Map<number, any>();
        for (const d of declencheurs) {
          const crit = d.criteres || {};
          let items = [...base];

          if (crit.montant_min != null) items = items.filter(f => Number(f.montant_restant ?? 0) >= Number(crit.montant_min));
          if (Array.isArray(crit.produit_code) && crit.produit_code.length) items = items.filter(f => crit.produit_code.includes(f.produit_code));
          if (Array.isArray(crit.type_client) && crit.type_client.length) items = items.filter(_ => crit.type_client.includes(client.type_client));
          if (crit.jours_apres_echeance_min != null) items = items.filter(f => daysLate(f.date_echeance) >= Number(crit.jours_apres_echeance_min));

          for (const f of items) eligible.set(Number(f.id), f);
        }

        const items = Array.from(eligible.values());
        return applyPageQuery(items, q, ['reference', 'objet', 'produit_code']);
      })
    );
  }

  // -----------------------
  // loaders + caches
  // -----------------------
  private getGroupesAll(): Observable<any[]> {
    if (!this.groupesAll$) {
      this.groupesAll$ = this.http.get<ApiListResponse<any>>(`${this.urlGroupes()}/`).pipe(
        map(normalizeList),
        map(r => r.results),
        tap(rows => rows.forEach((g: any) => this.groupeCache.set(Number(g.id), g))),
        shareReplay(1)
      );
    }
    return this.groupesAll$;
  }

  private getClientsAll(): Observable<any[]> {
    if (!this.clientsAll$) {
      this.clientsAll$ = this.http.get<ApiListResponse<any>>(`${this.urlClients()}/`).pipe(
        map(normalizeList),
        map(r => r.results),
        shareReplay(1)
      );
    }
    return this.clientsAll$;
  }

  private getFacturesAll(): Observable<any[]> {
    if (!this.facturesAll$) {
      this.facturesAll$ = this.http.get<ApiListResponse<any>>(`${this.urlFactures()}/`).pipe(
        map(normalizeList),
        map(r => r.results),
        shareReplay(1)
      );
    }
    return this.facturesAll$;
  }

  private getDeclencheursAll(): Observable<any[]> {
    if (!this.declencheursAll$) {
      this.declencheursAll$ = this.http.get<ApiListResponse<any>>(`${this.urlDeclencheurs()}/`).pipe(
        map(normalizeList),
        map(r => r.results),
        shareReplay(1)
      );
    }
    return this.declencheursAll$;
  }

  private invalidateGroupes(id?: number) {
    if (id != null) this.groupeCache.delete(Number(id));
    this.groupesAll$ = undefined;
  }
}
