import {Component, Input} from '@angular/core';
import {WorkflowHistory} from "../../shared/models/workflowHistory";
import {HistoriqueFicheTechnique} from "../../shared/models/historique-traitement-fiche-technique";

@Component({
  selector: 'historique-traitement',
  templateUrl: './historique-traitement.component.html',
  styleUrl: './historique-traitement.component.scss'
})
export class HistoriqueTraitementComponent {
 @Input() historiqueFicheTechniques:HistoriqueFicheTechnique[];
}

export const MOCK_TRANSITIONS: WorkflowHistory[] = [
  {
    id: 1,
    instance: 101,
    from_step: 1,
    from_step_code: 'DRAFT',
    to_step: 2,
    to_step_code: 'VALIDATED',
    transition: 1001,
    occurred_at: '2025-10-04T13:37:47.979Z',
    actor: 'Jean Dupont',
    comment: 'Validation automatique'
  },
  {
    id: 2,
    instance: 102,
    from_step: 2,
    from_step_code: 'VALIDATED',
    to_step: 3,
    to_step_code: 'APPROVED',
    transition: 1002,
    occurred_at: '2025-10-05T09:15:12.123Z',
    actor: 'Claire Martin',
    comment: 'Approuvé par le responsable'
  },
  {
    id: 3,
    instance: 103,
    from_step: 3,
    from_step_code: 'APPROVED',
    to_step: 4,
    to_step_code: 'COMPLETED',
    transition: 1003,
    occurred_at: '2025-10-06T17:45:30.456Z',
    actor: 'Admin',
    comment: 'Processus terminé'
  }
];
