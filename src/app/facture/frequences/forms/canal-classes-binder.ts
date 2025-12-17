import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClasseLargeurBandeService } from '../../../shared/services/classe-largeur-bande.service';
import { bindClasseField } from './frequences-classes-binder';

export function bindCanalClasses(
  canalFG: FormGroup,
  classeLargeurBande: ClasseLargeurBandeService,
  destroy$: Subject<void>
): void {

  // largeur_bande_mhz -> classe_largeur_bande
  bindClasseField(
    canalFG,
    'largeur_bande_mhz',
    'classe_largeur_bande',
    (lb) => classeLargeurBande.getClasseIdByLargeurBande(lb),
    destroy$,
    { debounceMs: 250 }
  );

  // Optionnel : calcul immédiat si pré-rempli
  const lb0 = canalFG.get('largeur_bande_mhz')?.value;
  if (lb0 != null) {
    classeLargeurBande.getClasseIdByLargeurBande(lb0)
      .pipe(takeUntil(destroy$))
      .subscribe(id => canalFG.get('classe_largeur_bande')?.setValue(id, { emitEvent: false }));
  }
}
