import { FormGroup } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

type ClasseLookupFn = (value: any) => Observable<number | null>;

interface BindOpts {
  debounceMs?: number;
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

  src.valueChanges.pipe(
    debounceTime(opts?.debounceMs ?? 250),
    distinctUntilChanged(),
    switchMap(v => lookup(v)),
    takeUntil(destroy$)
  ).subscribe((idClasse) => {
    tgt.setValue(idClasse, { emitEvent: false });
    tgt.markAsDirty();
  });
}
