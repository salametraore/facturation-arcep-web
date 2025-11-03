import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HistoriqueFicheTechnique } from '../../shared/models/historique-traitement-fiche-technique';

@Component({
  selector: 'historique-traitement',
  templateUrl: './historique-traitement.component.html'
})
export class HistoriqueTraitementComponent implements OnChanges {
  @Input() historiqueFicheTechniques: HistoriqueFicheTechnique[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['historiqueFicheTechniques'] && this.historiqueFicheTechniques) {
      // tri par ordre_chrono croissant
      this.historiqueFicheTechniques = [...this.historiqueFicheTechniques].sort(
        (a, b) => (a.ordre_chrono ?? 0) - (b.ordre_chrono ?? 0)
      );
    }
  }

  trackById = (_: number, item: HistoriqueFicheTechnique) =>
    (item as any).source_id ?? (item as any).id ?? `${item.fiche_technique_id}-${item.date_tache}`;

}
