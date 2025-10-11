import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Facture} from "../../shared/models/facture";

@Component({
  selector: 'app-fiche-technique-dgsn',
  templateUrl: './fiche-technique-dgsn.component.html',
  styleUrl: './fiche-technique-dgsn.component.scss'
})
export class FicheTechniqueDgsnComponent {
  ongletActif = 0;
  filtreForm: FormGroup;

  fichesTechniques: Facture[] = [
    // {
    //   : 'Internet Puissance Plus',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Serv mobiles à usage privé',
    //   statut: 'en cours de traitement',
    // },
    // {
    //   nom: 'Afrix Télécommunication',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Agrément d\'installateur',
    //   statut: 'en cours de traitement',
    // },
    // {
    //   nom: 'M Data Télécommunication',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Agrément d\'équipement',
    //   statut: 'en cours de traitement',
    // },
    // {
    //   nom: '2d Consulting',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'num court de la forme PX XX',
    //   statut: 'en cours de traitement',
    // },
  ];

  colonnesAffichees=[  'nom', 'dateSoumission', 'categorie', 'statut','actions'];

  constructor(private fb: FormBuilder) {
    this.filtreForm = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      categorieService: [''],
      statut: [''],
    });
  }

  exporter(): void {
    console.log("Export des données...");
  }

  ajouterFT(type: string): void {
    console.log(`Ajouter une fiche technique de type: ${type}`);
  }
}
