import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-nom-de-domaine-create',
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
    MatRadioModule,
    MatSelectModule
  ],
  templateUrl: './nom-de-domaine-create.html',
  styleUrls: ['./nom-de-domaine-create.css']
})
export class NomDeDomaineCreatePage {
  // Champs du formulaire
  domainName = '';
  selectedService = '';
  processingNote = '';
  newStatus: 'burkina_faso' | 'afrique' | 'hors_afrique' = 'burkina_faso';

  services = [
    { value: 'hebergement', label: 'Hébergement Web' },
    { value: 'nom_domaine', label: 'Nom de domaine' },
    { value: 'messagerie', label: 'Messagerie professionnelle' }
  ];

  // Stepper
  steps = [
    { label: 'Initialisation', description: 'Initialisation du dossier', tooltip: '' },
    { label: 'FTD', description: 'Frais de traitement de dossier', tooltip: 'FTD = Frais de traitement de dossier' },
    { label: 'RDA 1', description: 'Redevance annuelle 1', tooltip: 'RDA 1' },
    { label: 'RDA 2', description: 'Redevance annuelle 2', tooltip: 'RDA 2' },
    { label: 'RDA 3', description: 'Redevance annuelle 3', tooltip: 'RDA 3' }
  ];
  currentStep = 0;

  constructor(private router: Router) {}

  goToStep(index: number) {
    this.currentStep = index;
  }

  newForm() {
    this.domainName = '';
    this.selectedService = '';
    this.processingNote = '';
    this.newStatus = 'burkina_faso';
    alert('Nouveau formulaire prêt.');
  }

  save() {
    if (!this.domainName.trim()) {
      alert('Veuillez saisir un nom de domaine avant de transmettre.');
      return;
    }
    alert(
      `Nouvelle demande enregistrée :\nNom de domaine = ${this.domainName}\nService = ${this.selectedService || '—'}\nZone = ${this.newStatus}\nCommentaire = ${this.processingNote}`
    );
    this.router.navigate(['/dsi/nom-de-domaine']);
  }

  cancel() {
    this.router.navigate(['/dsi/nom-de-domaine']);
  }
}
