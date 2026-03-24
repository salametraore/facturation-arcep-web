import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecouvGroupesComponent } from './pages/recouv-groupes/recouv-groupes.component';
import { RecouvDeclencheursComponent } from './pages/recouv-declencheurs/recouv-declencheurs.component';
import { RecouvPlansComponent } from './pages/recouv-plans/recouv-plans.component';
import { RecouvTemplatesComponent } from './pages/recouv-templates/recouv-templates.component';
import { RecouvAgendaComponent } from './pages/recouv-agenda/recouv-agenda.component';
import { RecouvDashboardComponent } from "./pages/recouv-dashboard/recouv-dashboard.component";
import { RecouvPromessesComponent } from "./pages/recouv-promesses/recouv-promesses.component";
import { DefaultComponent } from "../shared/components/default/default.component";
import { RecouvClientComponent } from "./pages/recouv_client/recouv-client.component";
import { withAccess } from '../authentication/route-access.helper';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      withAccess('recouvrement/dashboard', { path: 'dashboard', component: RecouvDashboardComponent }),
      withAccess('recouvrement/groupes', { path: 'groupes', component: RecouvGroupesComponent }),
      withAccess('recouvrement/declencheurs', { path: 'declencheurs', component: RecouvDeclencheursComponent }),
      withAccess('recouvrement/plans', { path: 'plans', component: RecouvPlansComponent }),
      withAccess('recouvrement/templates', { path: 'templates', component: RecouvTemplatesComponent }),
      withAccess('recouvrement/promesses', { path: 'promesses', component: RecouvPromessesComponent }),
      withAccess('recouvrement/agenda', { path: 'agenda', component: RecouvAgendaComponent }),
      withAccess('recouvrement/clients', { path: 'clients', component: RecouvClientComponent }),
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecouvrementRoutingModule { }
