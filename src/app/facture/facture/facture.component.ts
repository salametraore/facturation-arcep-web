import { Component } from '@angular/core';
import {Facture} from "../../shared/models/facture";

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrl: './facture.component.scss'
})
export class FactureComponent {
  ongletActif = 0; // 0: Reçues, 1: Vérifiées, 2: Envoyées

  factures: Facture[] = [
    // {
    //   nom: 'Internet Puissance Plus',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Serv mobiles à usage privé',
    //   statut: 'en cours de traitement',
    // },
    // {
    //   nom: 'Afrix Télécommunication',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Serv mobiles ouverts au public',
    //   statut: 'vérifiée',
    // },
    // {
    //   nom: "M'Data Télécommunication",
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'Serv fixes',
    //   statut: 'envoyée',
    // },
    // {
    //   nom: '2d Consulting',
    //   dateSoumission: '30 avril 2025',
    //   categorie: 'num court de la forme PX XX',
    //   statut: 'en cours de traitement',
    // },
  ];

  colonnesAffichees: string[] = [
    'nom',
    'dateSoumission',
    'categorie',
    'statut',
    'actions',
  ];

  getFacturesParOnglet(): Facture[] {
    switch (this.ongletActif) {
      case 0: // Reçues
        // return this.factures.filter((f) => f.statut === 'en cours de traitement');
        return this.factures;
      case 1: // Vérifiées
        // return this.factures.filter((f) => f.statut === 'vérifiée');
        return this.factures;
      case 2: // Envoyées
        // return this.factures.filter((f) => f.statut === 'envoyée');
        return this.factures;
      default:
        return this.factures;
    }
  }
}
