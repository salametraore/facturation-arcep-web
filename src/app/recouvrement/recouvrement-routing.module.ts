import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RecouvGroupesComponent } from './pages/recouv-groupes/recouv-groupes.component';
import { RecouvDeclencheursComponent } from './pages/recouv-declencheurs/recouv-declencheurs.component';
import { RecouvPlansComponent } from './pages/recouv-plans/recouv-plans.component';
import { RecouvTemplatesComponent } from './pages/recouv-templates/recouv-templates.component';
import { RecouvAgendaComponent } from './pages/recouv-agenda/recouv-agenda.component';
import {RecouvDashboardComponent} from "./pages/recouv-dashboard/recouv-dashboard.component";
import {RecouvPromessesComponent} from "./pages/recouv-promesses/recouv-promesses.component";
import {DefaultComponent} from "../shared/components/default/default.component";
import {RecouvClientComponent} from "./pages/recouv_client/recouv-client.component";


const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: RecouvDashboardComponent },

      { path: 'groupes', component: RecouvGroupesComponent },
      { path: 'declencheurs', component: RecouvDeclencheursComponent },
      { path: 'plans', component: RecouvPlansComponent },
      { path: 'templates', component: RecouvTemplatesComponent },
      { path: 'promesses', component: RecouvPromessesComponent },
      { path: 'agenda', component: RecouvAgendaComponent },
      { path: 'clients', component: RecouvClientComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecouvrementRoutingModule { }
