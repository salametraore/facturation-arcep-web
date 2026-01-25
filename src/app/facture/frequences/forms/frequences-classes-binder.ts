// src/app/facture/frequences/forms/frequences-classes-binder.ts

import { FormGroup } from '@angular/forms';
import {
  Observable,
  Subject,
  combineLatest,
  of,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  startWith
} from 'rxjs';

type ClasseLookupFn = (value: any, categorieProduit?: any) => Observable<number | null>;

interface BindOpts {
  debounceMs?: number;

  /** Si présent, on lit categorie_produit dans ce control (sinon on tente 'categorie_produit') */
  categorieControl?: string;
}

export function bindClasseField(
  fg: FormGroup,
  sourceControl: string,
  targetControl: string,
  lookup: ClasseLookupFn,
  destroy$: Subject<void>,
  opts?: BindOpts
): void {

  const src = fg.get(sourceControl);
  const tgt = fg.get(targetControl);
  if (!src || !tgt) return;

  // Control de catégorie (si présent dans le FG)
  const catCtrl =
    (opts?.categorieControl ? fg.get(opts.categorieControl) : null) ??
      fg.get('categorie_produit');

  const src$ = src.valueChanges.pipe(
    startWith(src.value),
    debounceTime(opts?.debounceMs ?? 250),
    distinctUntilChanged()
  );

  const cat$ = catCtrl
    ? catCtrl.valueChanges.pipe(startWith(catCtrl.value), distinctUntilChanged())
    : of(null);

  combineLatest([src$, cat$]).pipe(
    switchMap(([v, cat]) => lookup(v, cat)),
    takeUntil(destroy$)
  ).subscribe((idClasse) => {
    tgt.setValue(idClasse, { emitEvent: false });
    tgt.markAsDirty();
  });
}
