// src/app/facture/frequences/forms/canal-classes-binder.ts

import { FormGroup } from '@angular/forms';
import { Subject, takeUntil, of } from 'rxjs';

import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { ClassePuissanceService } from '../../../shared/services/classe-puissance.service';
import { bindClasseField } from './frequences-classes-binder';

function toNumber(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function bindCanalClasses(
  canalFG: FormGroup,
  classeLargeurBande: ClasseLargeurBandeService,
  classePuissance: ClassePuissanceService,
  destroy$: Subject<void>
): void {

  const getCat = () => canalFG.get('categorie_produit')?.value ?? null;

  // ✅ largeur_bande_khz -> classe_largeur_bande (SANS conversion)
  bindClasseField(
    canalFG,
    'largeur_bande_khz',
    'classe_largeur_bande',
    (lbKhz, cat) => {
      const lb = toNumber(lbKhz);
      if (lb == null) return of(null);

      // ✅ ici lb est en kHz, et les classes doivent être en kHz aussi
      return classeLargeurBande.getClasseIdByLargeurBande(lb, cat);
    },
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // ✅ puissance_sortie -> classe_puissance_id
  bindClasseField(
    canalFG,
    'puissance_sortie',
    'classe_puissance_id',
    (p, cat) => classePuissance.getClasseIdByPuissance(p, cat),
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // ✅ Optionnel : calcul immédiat si pré-rempli
  const cat0 = getCat();

  const lb0 = canalFG.get('largeur_bande_khz')?.value;
  if (lb0 != null) {
    const lb = toNumber(lb0);
    if (lb != null) {
      classeLargeurBande.getClasseIdByLargeurBande(lb, cat0)
        .pipe(takeUntil(destroy$))
        .subscribe(id => canalFG.get('classe_largeur_bande')?.setValue(id, { emitEvent: false }));
    }
  }

  const p0 = canalFG.get('puissance_sortie')?.value;
  if (p0 != null) {
    classePuissance.getClasseIdByPuissance(p0, cat0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => canalFG.get('classe_puissance_id')?.setValue(id, { emitEvent: false }));
  }
}
