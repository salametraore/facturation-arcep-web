import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-facture-dfc',
  templateUrl: './facture-dfc.component.html',
  styleUrl: './facture-dfc.component.scss'
})
export class FactureDfcComponent {
  factureForm: FormGroup;
  etapes = ['Initialisation', 'PDF', 'BDF 1', 'BDF 2', 'BDF 3'];
  etapeActuelle = 0;

  constructor(private fb: FormBuilder) {
    this.factureForm = this.fb.group({
      client: ['', Validators.required],
      numeroCompteClient: ['', Validators.required],
      typeClient: ['Client ordinaire', Validators.required],
      objetFacture: ['', Validators.required],
      numeroCompteur: ['', Validators.required],
      coefficientFacturation: ['', Validators.required],
      moisFacture: ['Janvier', Validators.required],
      dateFacturation: ['', Validators.required],
      consommationHeurePleine: ['', Validators.required],
      consommationHeureCreuse: ['', Validators.required],
      differenceIndex: [''],
      puissanceSouscrite: [''],
      tarif: ['Tarif A'],
      coefficientTarifaire: [''],
      tva: [false],
      elements: this.fb.array([]),
      numeroCompte: [''],
      nomSignataire: ['', Validators.required],
    });
  }

  ajouterLigne(): void {
    // Logique pour ajouter une ligne au tableau des éléments
  }

  importerAnnexe(): void {
    // Logique pour importer une annexe
  }

  annuler(): void {
    // Logique pour annuler le formulaire
  }

  enregistrer(): void {
    // Logique pour enregistrer le formulaire
  }

  approver(): void {
    // Logique pour approuver le formulaire
  }
}
