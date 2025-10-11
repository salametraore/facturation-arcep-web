import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard/dashboard';
import { NomDeDomainePage } from './nom-de-domaine/nom-de-domaine';
import { NomDeDomaineCreatePage } from './nom-de-domaine/nom-de-domaine-create';
import { NomDeDomaineDetailPage } from './nom-de-domaine/nom-de-domaine-detail';
import { Statistique } from './statistique/statistique';
import { ClientPage } from './client/client';
import { ClientDetailPage } from './client/client-detail';
import { Notification } from './notification/notification';
import { ProfilSecurite } from './profil-securite/profil-securite';

// Service de confiance
import { ServiceDeConfiancePage } from './service-de-confiance/service-de-confiance';
import { ServiceDeConfianceCreatePage } from './service-de-confiance/service-de-confiance-create';
import { ServiceDeConfianceDetailPage } from './service-de-confiance/service-de-confiance-detail';

export const DSI_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },

  // Nom de domaine
  { path: 'nom-de-domaine', component: NomDeDomainePage },
  { path: 'nom-de-domaine/new', component: NomDeDomaineCreatePage },
  { path: 'nom-de-domaine/:id', component: NomDeDomaineDetailPage },

  // Service de confiance
  { path: 'service-de-confiance', component: ServiceDeConfiancePage },
  { path: 'service-de-confiance-detail/:id', component: ServiceDeConfianceDetailPage },
  { path: 'service-de-confiance-create', component: ServiceDeConfianceCreatePage },

  // Autres
  { path: 'statistique', component: Statistique },
  { path: 'client', component: ClientPage },
  { path: 'client-detail/:id', component: ClientDetailPage },
  { path: 'notification', component: Notification },
  { path: 'profil-securite', component: ProfilSecurite },
];
