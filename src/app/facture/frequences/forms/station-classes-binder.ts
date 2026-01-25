/// src/app/facture/frequences/forms/station-classes-binder.ts

import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ClassePuissanceService } from '../../../shared/services/classe-puissance.service';
import { ClasseDebitService } from '../../../shared/services/classe-debit.service';
import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { bindClasseField } from './frequences-classes-binder';

export function bindStationClasses(
  stationFG: FormGroup,
  services: {
    classePuissance: ClassePuissanceService;
    classeDebit: ClasseDebitService;
    classeLargeurBande: ClasseLargeurBandeService;
  },
  destroy$: Subject<void>
): void {

  // 👉 catégorie produit (si dans stationFG)
  const getCat = () => stationFG.get('categorie_produit')?.value ?? null;

  // puissance -> classe_puissance
  bindClasseField(
    stationFG,
    'puissance',
    'classe_puissance',
    (p, cat) => services.classePuissance.getClasseIdByPuissance(p, cat),
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // debit_kbps -> classe_debit
  bindClasseField(
    stationFG,
    'debit_kbps',
    'classe_debit',
    (d, cat) => services.classeDebit.getClasseIdByDebit(d, cat),
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // largeur_bande_mhz -> classe_largeur_bande
  bindClasseField(
    stationFG,
    'largeur_bande_mhz',
    'classe_largeur_bande',
    (lb, cat) => services.classeLargeurBande.getClasseIdByLargeurBande(lb, cat),
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // ✅ Optionnel : calcul immédiat à l’ouverture (si valeurs pré-remplies)
  const cat0 = getCat();

  const p0  = stationFG.get('puissance')?.value;
  const d0  = stationFG.get('debit_kbps')?.value;
  const lb0 = stationFG.get('largeur_bande_mhz')?.value;

  if (p0 != null) {
    services.classePuissance.getClasseIdByPuissance(p0, cat0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => stationFG.get('classe_puissance')?.setValue(id, { emitEvent: false }));
  }

  if (d0 != null) {
    services.classeDebit.getClasseIdByDebit(d0, cat0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => stationFG.get('classe_debit')?.setValue(id, { emitEvent: false }));
  }

  if (lb0 != null) {
    services.classeLargeurBande.getClasseIdByLargeurBande(lb0, cat0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => stationFG.get('classe_largeur_bande')?.setValue(id, { emitEvent: false }));
  }
}
