import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {DashboardDsiComponent} from "./dashboard-dsi/dashboard-dsi.component";
import {DashboardFicheTechniqueComponent} from "./dashboard-fiche-technique/dashboard-fiche-technique.component";
import {DashboardDfcComponent} from "./dashboard-dfc/dashboard-dfc.component";


@NgModule({
  declarations: [
    DashboardComponent,
    DashboardDsiComponent,
    DashboardFicheTechniqueComponent,
    DashboardDfcComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
  ]
})
export class DashboardModule { }
