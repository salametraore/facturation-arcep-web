import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-service-de-confiance-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule
  ],
  templateUrl: './service-de-confiance-create.html',
  styleUrls: ['./service-de-confiance-create.css']
})
export class ServiceDeConfianceCreatePage {
  currentStep = 0;

  steps = [
    { label: 'Demande', tooltip: 'Remplir les informations de la demande' },
    { label: 'Validation', tooltip: 'Étape de validation' },
    { label: 'Transmission', tooltip: 'Transmission au service concerné' }
  ];

  prestataire = '';
  formData = {
    typeService: '',
    beneficiaire: '',
    commentaire: ''
  };

  serviceTypes = [
    'Archivage électronique',
    'Certification électronique',
    'Horodatage électronique',
    'Signature numérique'
  ];

  constructor(private router: Router) {}

  goToStep(i: number) {
    this.currentStep = i;
  }

  cancel() {
    this.router.navigate(['/dsi/service-de-confiance']);
  }

  save() {
    alert('Nouvelle demande de service de confiance enregistrée avec succès.');
    this.router.navigate(['/dsi/service-de-confiance']);
  }

  newForm() {
    this.prestataire = '';
    this.formData = { typeService: '', beneficiaire: '', commentaire: '' };
  }
}
