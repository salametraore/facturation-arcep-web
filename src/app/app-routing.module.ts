import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';

const routes: Routes = [
  // 🔹 On charge le module Facture comme point d'entrée par défaut
  {
    path: '',
    redirectTo: 'facture/factures',
    pathMatch: 'full'
  },

  // 🔹 Module Auth (login, mot de passe oublié)
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },

  // 🔹 Module Facture (celui sur lequel tu veux travailler)
  {
    path: 'facture',
    loadChildren: () =>
      import('./facture/facture.module').then((m) => m.FactureModule),
    canActivate: [AuthGuard],
  },

  // 🔹 Les autres modules si besoin
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'parametre',
    loadChildren: () =>
      import('./parametre/parametre.module').then((m) => m.ParametreModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },

  // 🔹 Page 404 → redirection vers Facture
  { path: '**', redirectTo: 'facture/factures' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
