import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio'; // <-- IMPORTANT

@Component({
  selector: 'app-nom-de-domaine-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatRadioModule // <-- ajouter ici
  ],
  templateUrl: './nom-de-domaine-detail.html',
  styleUrls: ['./nom-de-domaine-detail.css']
})
export class NomDeDomaineDetailPage {
  id = '';
  item: any = null;
  processingNote = '';

  // nouvelle zone géographique (radio)
  newStatus: 'burkina_faso' | 'afrique' | 'hors_afrique' = 'burkina_faso';

  // Stepper
  steps = [
    { label: 'Initialisation', description: 'Initialisation du dossier', tooltip: '' },
    { label: 'FTD', description: 'Frais de traitement de dossier', tooltip: 'FTD = Frais de traitement de dossier' },
    { label: 'RDA 1', description: 'Redevance annuelle 1', tooltip: 'Redevance annuelle 1' },
    { label: 'RDA 2', description: 'Redevance annuelle 2', tooltip: 'Redevance annuelle 2' },
    { label: 'RDA 3', description: 'Redevance annuelle 3', tooltip: 'Redevance annuelle 3' }
  ];
  currentStep = 0;

  // Historique
  history = [
    { date: '2025-01-20', action: 'Création', note: 'Dossier créé par le client.' },
    { date: '2025-01-22', action: 'Traitement initial', note: 'Vérification initiale effectuée.' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id === '1') {
      this.item = { id:'1', name:'internetpuissance.bf', serviceCategory:"Bureau d'enregistrement", receivedAt:'2025-01-20', status:'nouveau' };
    } else {
      this.item = { id:this.id, name:'inconnu', serviceCategory:'—', receivedAt:'2025-01-01', status:'nouveau' };
    }
  }

  // Stepper
  goToStep(index: number) {
    this.currentStep = index;
  }

  // utilitaire pour afficher label lisible d'une radio
  getZoneLabel(value: string) {
    const map: Record<string, string> = {
      'burkina_faso': 'Burkina Faso',
      'afrique': 'Afrique',
      'hors_afrique': 'Hors Afrique'
    };
    return map[value] ?? value;
  }

  // Sauvegarde / Transmettre (affiche le label lisible)
  save() {
    alert(
      `Changements sauvegardés :\nZone géographique = ${this.getZoneLabel(this.newStatus)}\nCommentaire = ${this.processingNote}`
    );
    this.router.navigate(['/dsi/nom-de-domaine']);
  }

  // Annuler
  cancel() {
    this.router.navigate(['/dsi/nom-de-domaine']);
  }

  // Popup Rejeter / Notifier
  openRejectNotify() {
    const message = prompt('Saisir le message à envoyer au client :', '');
    if (message !== null && message.trim() !== '') {
      alert(`Message envoyé au client :\n"${message}"`);
      this.history.push({ date: new Date().toISOString().split('T')[0], action: 'Rejet/Notification', note: message });
    }
  }
}
  