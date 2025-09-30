import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DefaultComponent} from "../shared/components/default/default.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {DashboardDsiComponent} from "./dashboard-dsi/dashboard-dsi.component";
import {DashboardFicheTechniqueComponent} from "./dashboard-fiche-technique/dashboard-fiche-technique.component";
import {DashboardDfcComponent} from "./dashboard-dfc/dashboard-dfc.component";

const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      {path: '', component: DashboardComponent},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'dashboard-dsi', component: DashboardDsiComponent},
      {path: 'dashboard-fiche-technique', component: DashboardFicheTechniqueComponent},
      {path: 'dashboard-dfc', component: DashboardDfcComponent},
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
