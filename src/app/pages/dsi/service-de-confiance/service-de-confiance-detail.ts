import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

interface HistoryItem {
  date: string;
  action: string;
  note: string;
}

interface RequestItem {
  id: string;
  name: string;
  serviceCategory: string;
  receivedAt: string;
  status: string;
}

@Component({
  selector: 'app-service-de-confiance-detail',
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
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './service-de-confiance-detail.html',
  styleUrls: ['./service-de-confiance-detail.css']
})
export class ServiceDeConfianceDetailPage {
  id = '';
  item: RequestItem | null = null;
  processingNote = '';
  newStatus = 'Service de certification électronique';

  // mêmes étapes que nom-de-domaine-detail (tu l'avais demandé)
  steps = [
    { label: 'Initialisation', description: 'Initialisation du dossier', tooltip: '' },
    { label: 'FTD', description: 'Frais de traitement de dossier', tooltip: 'FTD = Frais de traitement de dossier' },
    { label: 'RDA 1', description: 'Redevance annuelle 1', tooltip: 'RDA 1' },
    { label: 'RDA 2', description: 'Redevance annuelle 2', tooltip: 'RDA 2' },
    { label: 'RDA 3', description: 'Redevance annuelle 3', tooltip: 'RDA 3' }
  ];
  currentStep = 0;

  history: HistoryItem[] = [
    { date: '2025-01-20', action: 'Création', note: 'Dossier créé par le client.' },
    { date: '2025-01-22', action: 'Traitement initial', note: 'Vérification initiale effectuée.' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    // données de démonstration (comme avant) — laissé tel quel
    this.item = {
      id: this.id,
      name: this.id === '1' ? 'Prestataire Alpha' : 'Prestataire Inconnu',
      serviceCategory: 'Archivage électronique',
      receivedAt: '2025-01-20',
      status: 'nouveau'
    };
  }

  // Stepper navigation
  goToStep(index: number) {
    this.currentStep = index;
  }

  // Sauvegarde / Transmettre
  save() {
    alert(`Changements sauvegardés :\nCatégorie = ${this.newStatus}\nCommentaire = ${this.processingNote}`);
    this.router.navigate(['/dsi/service-de-confiance']);
  }

  // Annuler (si besoin)
  cancel() {
    this.router.navigate(['/dsi/service-de-confiance']);
  }

  // Popup Rejeter / Notifier
  openRejectNotify() {
    const message = prompt('Saisir le message à envoyer au client :', '');
    if (message !== null && message.trim() !== '') {
      alert(`Message envoyé au client :\n"${message}"`);
      this.history.push({
        date: new Date().toISOString().split('T')[0],
        action: 'Rejet/Notification',
        note: message
      });
    }
  }
}
