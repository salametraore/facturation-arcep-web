// src/app/shared/services/base-classe.service.ts

import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export type CategorieProduitValue = number | string;

/**
 * Base générique pour les classes (puissance / débit / largeur bande)
 * - cache getListItems() via shareReplay(1)
 * - utilitaires: isInRange + choix de la classe la plus "spécifique"
 * - support optionnel de categorie_produit (important si les plages se chevauchent)
 */
export abstract class BaseClasseService<T extends { id: number; categorie_produit?: CategorieProduitValue | null }> {

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

  /**
   * Détermine la meilleure classe pour une valeur donnée.
   * Si categorieProduit est fourni, on filtre d'abord sur cette catégorie
   * (sinon chevauchement possible entre catégories).
   *
   * Stratégie :
   * 1) classes exact match categorie_produit
   * 2) fallback sur classes globales (categorie_produit null) si aucune classe catégorie n'existe
   */
  protected findBestClasseId(
    items: T[],
    value: number,
    getMin: (x: T) => number | null,
    getMax: (x: T) => number | null,
    categorieProduit?: CategorieProduitValue | null
  ): number | null {

    const scoped = this.pickItemsForCategorie(items ?? [], categorieProduit);

    const candidates = scoped
      .filter(x => x?.id != null)
      .filter(x => this.isInRange(value, getMin(x), getMax(x)))
      .sort((a, b) => this.rangeSize(getMin(a), getMax(a)) - this.rangeSize(getMin(b), getMax(b)));

    return candidates.length ? candidates[0].id : null;
  }

  /**
   * Filtrage catégorie :
   * - si categorieProduit null/undefined => pas de filtre
   * - sinon :
   *   - on prend d'abord les items de la catégorie
   *   - si aucun item dans cette catégorie => fallback sur items globaux (categorie_produit null)
   */
  protected pickItemsForCategorie(items: T[], categorieProduit?: CategorieProduitValue | null): T[] {
    if (categorieProduit === null || categorieProduit === undefined || categorieProduit === '') {
      return items;
    }

    const target = this.normalizeCategorie(categorieProduit);

    const exact = items.filter(x => {
      const c = (x?.categorie_produit ?? null);
      if (c === null || c === undefined || c === '') return false;
      return this.normalizeCategorie(c) === target;
    });

    if (exact.length > 0) return exact;

    // fallback sur classes "globales"
    return items.filter(x => (x?.categorie_produit ?? null) === null || x?.categorie_produit === undefined || x?.categorie_produit === '');
  }

  protected normalizeCategorie(v: CategorieProduitValue): string {
    return String(v).trim().toLowerCase();
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
