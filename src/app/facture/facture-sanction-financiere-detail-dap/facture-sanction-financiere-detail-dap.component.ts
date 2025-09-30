import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-facture-sanction-financiere-detail-dap',
  templateUrl: './facture-sanction-financiere-detail-dap.component.html',
  styleUrl: './facture-sanction-financiere-detail-dap.component.scss'
})
export class FactureSanctionFinanciereDetailDapComponent {
  factureForm: FormGroup;
  etapes = ['Initialisation', 'Frais de traitement de dossier', 'Analyse technique', 'Facturation', 'Devis', 'Rejetée / clos'];
  etapeActuelle = 1; // Étape actuelle : "Frais de traitement de dossier"

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.factureForm = this.fb.group({
      client: ['Africa Global Tech', Validators.required],
      numeroCompteClient: ['9000007', Validators.required],
      typeClient: ['Client ordinaire', Validators.required],
      totalFacture: ['500 504 FCFA', Validators.required],
      numeroCompte: ['BICIAB N°053 0083 813 00193 - 13', Validators.required],
      nomSignataire: ['GUEDRAOGO Salimata - Directrice des affaires financières', Validators.required],
    });
  }

  importerAnnexe(): void {
    // Logique pour importer une annexe
    console.log("Importation des annexes...");
  }

  annuler(): void {
    // Logique pour annuler le formulaire
    console.log("Annuler");
  }

  approuver(): void {
    // Logique pour approuver le formulaire
    console.log("Approuver");
  }

  enregistrerEtTelecharger(): void {
    // Logique pour enregistrer et télécharger le formulaire
    console.log("Enregistrer et télécharger");
  }
}
