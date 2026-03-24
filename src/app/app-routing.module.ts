import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { ForbiddenComponent } from './shared/components/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  },

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'facture',
    loadChildren: () => import('./facture/facture.module').then(m => m.FactureModule),
    canActivate: [AuthGuard]
  },
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
  {
    path: 'recouvrement',
    loadChildren: () => import('./recouvrement/recouvrement.module').then(m => m.RecouvrementModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'forbidden',
    component: ForbiddenComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
