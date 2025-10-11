import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-facture-recu-dgsn',
  templateUrl: './facture-recu-dgsn.component.html',
  styleUrl: './facture-recu-dgsn.component.scss'
})
export class FactureRecuDgsnComponent {
  factureForm: FormGroup;
  etapes = ['Initialisation', 'FTD', 'BD1', 'BD2', 'BD3', 'BD4', 'BD5'];
  etapeActuelle = 1; // Étape actuelle : "FTD"

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.factureForm = this.fb.group({
      client: ['Internet Puissance Plus', Validators.required],
      nomToget: ['TAPSOBA Silémané', Validators.required],
      objetFacture: ['', Validators.required],
      elementsTechniques: this.fb.array([]),
      numeroCompte: ['SICIAS N°053 0063 813 00193 - 13', Validators.required],
      nomSignataire: ['', Validators.required],
      commentaires: [''],
    });
  }

  importerAnnexe(): void {
    console.log("Importation des annexes...");
  }

  rejeterEtNotifier(): void {
    console.log("Rejeter et Notifier la direction");
  }

  approuver(): void {
    console.log("Approuver");
  }

  enregistrer(): void {
    console.log("Enregistrer");
  }
}
