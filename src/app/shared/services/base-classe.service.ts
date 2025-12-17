//src/app/shared/services/base-classe.service.ts

import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

/**
 * Base générique pour les classes (puissance / débit / largeur bande)
 * - cache getListItems() via shareReplay(1)
 * - utilitaires: isInRange + choix de la classe la plus "spécifique"
 */
export abstract class BaseClasseService<T extends { id: number }> {

  protected constructor(protected http: HttpClient) {}

  /** ex: `${baseUrl}/classe-puissance-frequences` */
  protected abstract get baseUrl(): string;

  private listCache$?: Observable<T[]>;

  refresh(): void {
    this.listCache$ = undefined;
  }

  /** Liste cachée */
  getListItems(): Observable<T[]> {
    if (!this.listCache$) {
      this.listCache$ = this.http.get<T[]>(`${this.baseUrl}/`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.listCache$;
  }

  // CRUD (optionnels mais pratiques)
  create(payload: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/`, payload);
  }

  getItem(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, payload: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  // ---------- utilitaires communs ----------
  protected findBestClasseId(
    items: T[],
    value: number,
    getMin: (x: T) => number | null,
    getMax: (x: T) => number | null
  ): number | null {

    const candidates = (items ?? [])
      .filter(x => x?.id != null)
      .filter(x => this.isInRange(value, getMin(x), getMax(x)))
      .sort((a, b) => this.rangeSize(getMin(a), getMax(a)) - this.rangeSize(getMin(b), getMax(b)));

    return candidates.length ? candidates[0].id : null;
  }

  protected isInRange(v: number, min: number | null, max: number | null): boolean {
    const okMin = (min == null) ? true : v >= min;
    const okMax = (max == null) ? true : v <= max;
    return okMin && okMax;
  }

  protected rangeSize(min: number | null, max: number | null): number {
    if (min == null || max == null) return Number.POSITIVE_INFINITY;
    return Math.max(0, max - min);
  }

  /** helper conversion (support "1,25" -> 1.25) */
  protected toNumber(v: number | string | null | undefined): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
}
