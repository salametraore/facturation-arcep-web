import { Component } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-facture-detail-dfc-electricite',
  templateUrl: './facture-detail-dfc-electricite.component.html',
  styleUrl: './facture-detail-dfc-electricite.component.scss'
})
export class FactureDetailDfcElectriciteComponent {
  factureForm: FormGroup;
  etapes = ['Initialisation', 'PDF', 'BDF 1', 'BDF 2', 'BDF 3'];
  etapeActuelle = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.factureForm = this.fb.group({
      client: ['', Validators.required],
      numeroCompteClient: ['', Validators.required],
      typeClient: ['Client ordinaire', Validators.required],
      objetFacture: ['', Validators.required],
      designations: this.fb.array([]),
      elements: this.fb.array([]),
      numeroCompte: ['SICAS N°523 0003 819 05593 - 13'],
      nomSignataire: ['', Validators.required],
    });

    this.ajouterDesignation();
  }

  get designations(): FormArray {
    return this.factureForm.get('designations') as FormArray;
  }

  get elements(): FormArray {
    return this.factureForm.get('elements') as FormArray;
  }

  ajouterDesignation(): void {
    const designationGroup = this.fb.group({
      designation: ['', Validators.required],
      prixUnitaire: ['', Validators.required],
      quantite: ['', Validators.required],
    });
    this.designations.push(designationGroup);
  }

  ajouterElement(): void {
    const elementGroup = this.fb.group({
      element: ['', Validators.required],
      valeur: ['', Validators.required],
    });
    this.elements.push(elementGroup);
  }

  importerAnnexe(): void {
    // Logique pour importer une annexe
  }

  annuler(): void {
    // Logique pour annuler le formulaire
  }

  approuver(): void {
    // Logique pour approuver le formulaire
  }

  enregistrer(): void {
    // Logique pour enregistrer le formulaire
  }
}
