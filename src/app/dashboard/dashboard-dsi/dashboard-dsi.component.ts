import {Component, OnInit} from '@angular/core';
import {Client} from "../../shared/models/client";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-dashboard-dsi',
  templateUrl: './dashboard-dsi.component.html',
  styleUrl: './dashboard-dsi.component.scss'
})
export class DashboardDsiComponent implements OnInit{ // Données pour les cartes de statistiques

  cards:any;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Données pour les cartes de statut
    this.cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(({ matches }) => {
        if (matches) {
          return [
            { title: '13 Bureaux d\'enregistrement', cols: 1, rows: 1, icon: '🌐', color: 'primary' },
            { title: '8 Prestataires de services de confiance', cols: 1, rows: 1, icon: '📞', color: 'accent' },
            { title: '8 Instances', cols: 1, rows: 1, icon: '🔗', color: 'warn' }
          ];
        }
        return [
          { title: '13 Bureaux d\'enregistrement', cols: 2, rows: 1, icon: '🌐', color: 'primary' },
          { title: '8 Prestataires de services de confiance', cols: 2, rows: 1, icon: '📞', color: 'accent' },
          { title: '8 Instances', cols: 2, rows: 1, icon: '🔗', color: 'warn' }
        ];
      })
    );
  }

  // Données pour la table des clients
  displayedColumns: string[] = ['client', 'categorie', 'expiration'];
  dataSource = [
    { client: 'Internet Puissance Plus', categorie: 'Bureau d\'enregistrement', expiration: '01 février 2025' },
    { client: 'Afix Télécommunications', categorie: 'Service d\'archivage électronique', expiration: '13 mars 2025' },
    { client: 'Netis', categorie: 'Bureau d\'enregistrement', expiration: '13 mars 2025' },
    { client: 'Internet Puissance Plus', categorie: 'Service d\'archivage électronique', expiration: '01 avril 2025' },
    { client: 'Orange Burkina', categorie: 'Service d\'archivage électronique', expiration: '01 avril 2025' }
  ];

  // Filtres pour la table (statut et service)
  statutFilter = '';
  serviceFilter = '';

  ngOnInit() {
    // Logique pour charger les données réelles (ex. : via un service HTTP)
  }
}
