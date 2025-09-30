import { Component } from '@angular/core';
import {Facture} from "../../shared/models/facture";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
// Données pour les cartes de statistiques
  stats = {
    frequencesLivrees: {
      valeur: "23 053 500 f cfa",
      description: "Nombre de fréquences livrées",
      icone: "camera_alt",
    },
    totalFactures: {
      valeur: "51 factures",
      description: "Total des factures du mois",
      icone: "description",
    },
    recouvrementsEnAttente: {
      valeur: "13 recouvrements",
      description: "Recouvrements en attente",
      icone: "pending_actions",
    },
  };

  // Données pour le tableau des factures récentes
  facturesRecentes: Facture[] = [
  //   {
  //     lignes_facture: "Facture de fourniture d’accès internet",
  //     numero: "1425367",
  //     dateEnregistrement: "01 février 2025",
  //     telephone: "+22676760000",
  //     icone: "wifi",
  //   },
  //   {
  //     objet: "Facture de fourniture d’accès internet",
  //     numero: "2125367",
  //     dateEnregistrement: "13 mars 2025",
  //     telephone: "+22676700181",
  //     icone: "wifi",
  //   },
  //   {
  //     objet: "Factures de loyer",
  //     numero: "1428588",
  //     dateEnregistrement: "13 mars 2025",
  //     telephone: "+22676010203",
  //     icone: "home",
  //   },
  //   {
  //     objet: "Facture de fourniture d’accès internet",
  //     numero: "6851300",
  //     dateEnregistrement: "01 avril 2025",
  //     telephone: "+22670214586",
  //     icone: "wifi",
  //   },
  //   {
  //     objet: "Facture de fourniture d’électricité",
  //     numero: "684946",
  //     dateEnregistrement: "01 avril 2025",
  //     telephone: "+22670214586",
  //     icone: "electric_bolt",
  //   },
  ];

  // Colonnes à afficher dans le tableau
  colonnesAffichees: string[] = ["icone", "objet", "numero", "dateEnregistrement", "telephone"];

}
