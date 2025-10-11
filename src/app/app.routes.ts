import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { OtpPage } from './pages/otp/otp';
import { DSI_ROUTES } from './pages/dsi/dsi.routes';
import { DsiLayout } from './pages/dsi/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },   // par défaut vers login
  { path: 'login', component: LoginPage },
  { path: 'otp', component: OtpPage },

  // ✅ Regroupe toutes les routes DSI (dont service-de-confiance)
  {
    path: 'dsi',
    component: DsiLayout,
    children: DSI_ROUTES
  },

  // ✅ Route par défaut pour les chemins inconnus
  { path: '**', redirectTo: 'dsi/dashboard', pathMatch: 'full' }
];
