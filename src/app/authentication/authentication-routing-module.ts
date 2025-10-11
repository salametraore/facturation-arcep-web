import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent} from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
  // Cette route permet d'accéder à la page de connexion via l'URL /login
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent } // Ajoute cette route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
