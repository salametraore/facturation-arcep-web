import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./authentication/auth.guard";

const routes: Routes = [
  {
    path: 'auth', // URL principale pour le module d'authentification
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  },
  {path: '', redirectTo: 'auth/login', pathMatch: 'full'},
  {path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule), canActivate: [AuthGuard]},
  {path: 'facture', loadChildren: () => import('./facture/facture.module').then(m => m.FactureModule)},
  {
    path: 'parametre',
    loadChildren: () => import('./parametre/parametre.module').then(m => m.ParametreModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },

  {path: '**', redirectTo: 'login'},


  {
    path: 'recouvrement',
    loadChildren: () => import('./recouvrement/recouvrement.module').then(m => m.RecouvrementModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
