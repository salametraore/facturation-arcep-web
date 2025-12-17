import { FormGroup } from '@angular/forms';
import { Subject, of, map, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ClassePuissanceService } from '../../../shared/services/classe-puissance.service';
import { ClasseDebitService } from '../../../shared/services/classe-debit.service';
import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { bindClasseField } from './frequences-classes-binder';

function toNumber(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function bindStationClasses(
  stationFG: FormGroup,
  services: {
    classePuissance: ClassePuissanceService;
    classeDebit: ClasseDebitService;
    classeLargeurBande: ClasseLargeurBandeService;
  },
  destroy$: Subject<void>
): void {

  // puissance -> classe_puissance
  bindClasseField(
    stationFG,
    'puissance',
    'classe_puissance',
    (p) => services.classePuissance.getClasseIdByPuissance(p),
    destroy$,
    { debounceMs: 250 }
  );

  // debit_kbps -> classe_debit
  bindClasseField(
    stationFG,
    'debit_kbps',
    'classe_debit',
    (d) => services.classeDebit.getClasseIdByDebit(d),
    destroy$,
    { debounceMs: 250 }
  );

  // largeur_bande_mhz -> classe_largeur_bande
  bindClasseField(
    stationFG,
    'largeur_bande_mhz',
    'classe_largeur_bande',
    (lb) => services.classeLargeurBande.getClasseIdByLargeurBande(lb),
    destroy$,
    { debounceMs: 250 }
  );

  // Optionnel : calcul immédiat à l’ouverture (si valeurs pré-remplies)
  const p0  = stationFG.get('puissance')?.value;
  const d0  = stationFG.get('debit_kbps')?.value;
  const lb0 = stationFG.get('largeur_bande_mhz')?.value;

  if (p0 != null) services.classePuissance.getClasseIdByPuissance(p0)
    .pipe(takeUntil(destroy$))
    .subscribe(id => stationFG.get('classe_puissance')?.setValue(id, { emitEvent: false }));

  if (d0 != null) services.classeDebit.getClasseIdByDebit(d0)
    .pipe(takeUntil(destroy$))
    .subscribe(id => stationFG.get('classe_debit')?.setValue(id, { emitEvent: false }));

  if (lb0 != null) services.classeLargeurBande.getClasseIdByLargeurBande(lb0)
    .pipe(takeUntil(destroy$))
    .subscribe(id => stationFG.get('classe_largeur_bande')?.setValue(id, { emitEvent: false }));
}
