import { Injectable } from '@angular/core';
import { PageQuery, PageResult } from './rcv-query';
import { RcvSeedLoaderService } from './rcv-seed-loader.service';

@Injectable({ providedIn: 'root' })
export class RcvStoreService {
  constructor(private seed: RcvSeedLoaderService) {}

  private readDb(): any {
    return JSON.parse(localStorage.getItem(this.seed.storageKey) || '{}');
  }
  private writeDb(db: any): void {
    localStorage.setItem(this.seed.storageKey, JSON.stringify(db));
  }

  list<T>(collection: string): T[] {
    const db = this.readDb();
    return (db[collection] || []) as T[];
  }

  getById<T>(collection: string, id: number): T | undefined {
    return this.list<any>(collection).find(x => x.id === id);
  }

  create<T>(collection: string, dto: any): T {
    const db = this.readDb();
    db[collection] = db[collection] || [];
    const nextId = Math.max(0, ...db[collection].map((x: any) => x.id)) + 1;
    const row = { id: nextId, ...dto };
    db[collection].push(row);
    this.writeDb(db);
    return row as T;
  }

  update<T>(collection: string, id: number, patch: any): T {
    const db = this.readDb();
    const arr = db[collection] || [];
    const idx = arr.findIndex((x: any) => x.id === id);
    if (idx < 0) throw new Error(`${collection}#${id} not found`);
    arr[idx] = { ...arr[idx], ...patch };
    this.writeDb(db);
    return arr[idx] as T;
  }

  delete(collection: string, id: number): void {
    const db = this.readDb();
    db[collection] = (db[collection] || []).filter((x: any) => x.id !== id);
    this.writeDb(db);
  }

  private getByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  query<T>(collection: string, q: PageQuery, searchableFields: string[] = []): PageResult<T> {
    let items: any[] = [...this.list<any>(collection)];

    if (q.filters) {
      for (const [k, v] of Object.entries(q.filters)) {
        if (v === null || v === undefined || v === '') continue;
        items = items.filter(row => {
          const val = this.getByPath(row, k); // k peut être "criteres.jours_apres_echeance_min"
          if (v === 'NOT_NULL') return val !== null && val !== undefined;
          if (v === 'IS_NULL') return val === null || val === undefined;
          return val === v;
        });

      }
    }

    if (q.search && q.search.trim() && searchableFields.length) {
      const s = q.search.trim().toLowerCase();
      items = items.filter(row =>
        searchableFields.some(f => String(row?.[f] ?? '').toLowerCase().includes(s))
      );
    }

    if (q.sort) {
      const [field, dir] = q.sort.split(',');
      const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      items.sort((a, b) => (a?.[field] > b?.[field] ? 1 : a?.[field] < b?.[field] ? -1 : 0) * d);
    }

    const total = items.length;
    const pageSize = q.pageSize ?? 25;
    const page = q.page ?? 1;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize) as T[], page, pageSize, total };
  }
}
