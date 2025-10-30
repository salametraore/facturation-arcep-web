import { Component, Input } from '@angular/core';
import { HistoriqueFicheTechnique } from '../../shared/models/historique-traitement-fiche-technique';

@Component({
  selector: 'historique-traitement',
  templateUrl: './historique-traitement.component.html',
  styleUrls: ['./historique-traitement.component.scss']   // ← corriger ici
})
export class HistoriqueTraitementComponent {
  @Input() historiqueFicheTechniques: HistoriqueFicheTechnique[] = [];  // ← éviter undefined

  trackById = (_: number, item: HistoriqueFicheTechnique) =>
    (item as any).source_id ?? (item as any).id ?? `${item.fiche_technique_id}-${item.date_tache}`;
}
