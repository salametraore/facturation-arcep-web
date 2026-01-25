// src/app/facture/frequences/forms/canal-classes-binder.ts

import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { bindClasseField } from './frequences-classes-binder';

export function bindCanalClasses(
  canalFG: FormGroup,
  classeLargeurBande: ClasseLargeurBandeService,
  destroy$: Subject<void>
): void {

  const getCat = () => canalFG.get('categorie_produit')?.value ?? null;

  // largeur_bande_mhz -> classe_largeur_bande
  bindClasseField(
    canalFG,
    'largeur_bande_khz',
    'classe_largeur_bande',
    (lb, cat) => classeLargeurBande.getClasseIdByLargeurBande(lb, cat),
    destroy$,
    { debounceMs: 250, categorieControl: 'categorie_produit' }
  );

  // ✅ Optionnel : calcul immédiat si pré-rempli
  const lb0 = canalFG.get('largeur_bande_khz')?.value;
  const cat0 = getCat();

  if (lb0 != null) {
    classeLargeurBande.getClasseIdByLargeurBande(lb0, cat0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => canalFG.get('classe_largeur_bande')?.setValue(id, { emitEvent: false }));
  }
}
