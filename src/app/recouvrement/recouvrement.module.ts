import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecouvrementRoutingModule } from './recouvrement-routing.module';

import { RecouvGroupesComponent } from './pages/recouv-groupes/recouv-groupes.component';
import { RecouvDeclencheursComponent } from './pages/recouv-declencheurs/recouv-declencheurs.component';
import { RecouvPlansComponent } from './pages/recouv-plans/recouv-plans.component';
import { RecouvTemplatesComponent } from './pages/recouv-templates/recouv-templates.component';
import { RecouvAgendaComponent } from './pages/recouv-agenda/recouv-agenda.component';
import {RecouvDashboardComponent} from "./pages/recouv-dashboard/recouv-dashboard.component";

import {FactureRoutingModule} from "../facture/facture-routing.module";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {MaterialModule} from "../material/material.module";
import {RecouvGroupesEditDialogComponent} from "./pages/recouv-groupes/recouv-groupes-edit-dialog/recouv-groupes-edit-dialog.component";
import { RecouvGroupesDynFacturesDialogComponent } from './pages/recouv-groupes/recouv-groupes-dyn-factures-dialog/recouv-groupes-dyn-factures-dialog.component';
import {RecouvDeclencheurEditDialogComponent} from "./pages/recouv-declencheurs/recouv-declencheur-edit-dialog.component";
import {RecouvPlansEditDialogComponent} from "./pages/recouv-plans/recouv-plans-edit-dialog.component";
import {RecouvTemplatesEditDialogComponent} from "./pages/recouv-templates/recouv-templates-edit-dialog.component";
import {RecouvAgendaDetailsDialogComponent} from "./pages/recouv-agenda/recouv-agenda-details-dialog.component";
import { RecouvPromessesComponent } from './pages/recouv-promesses/recouv-promesses.component';
import {RecouvPromessesDetailsDialogComponent} from "./pages/recouv-promesses/recouv-promesses-details-dialog.component";
import {RecouvClientComponent} from "./pages/recouv_client/recouv-client.component";
import {RecouvClientTablesComponent} from "./pages/recouv_client/recouv-client-tables/recouv-client-tables.component";
import {RecouvClientCrudComponent} from "./pages/recouv_client/recouv-client-crud/recouv-client-crud.component";
import {RecouvClientEncaissementsComponent} from "./pages/recouv_client/recouv-client-tables/recouv-client-encaissements/recouv-client-encaissements.component";
import {RecouvClientFacturesComponent} from "./pages/recouv_client/recouv-client-tables/recouv_client-factures/recouv-client-factures.component";
import {RecouvClientFichesTechniques} from "./pages/recouv_client/recouv-client-tables/recouv-client-fiches-techniques/recouv-client-fiches-techniques";
import {RecouvClientReleveCompteComponent} from "./pages/recouv_client/recouv-client-tables/recouv-client-releve-compte/recouv-client-releve-compte.component";
import {RecouvClientRelancesComponent} from "./pages/recouv_client/recouv-client-tables/recouv-client-relances/recouv-client-relances.component";
import {RecouvClientPromessesComponent} from "./pages/recouv_client/recouv-client-tables/recouv-client-promesses/recouv-client-promesses.component";

@NgModule({
  declarations: [
    RecouvGroupesComponent,
    RecouvDeclencheursComponent,
    RecouvPlansComponent,
    RecouvPlansEditDialogComponent,
    RecouvTemplatesComponent,
    RecouvTemplatesEditDialogComponent,
    RecouvAgendaComponent,
    RecouvAgendaDetailsDialogComponent,
    RecouvDashboardComponent,
    RecouvGroupesEditDialogComponent,
    RecouvGroupesDynFacturesDialogComponent,
    RecouvDeclencheurEditDialogComponent,
    RecouvPromessesComponent,
    RecouvPromessesDetailsDialogComponent,
    RecouvClientComponent,
    RecouvClientTablesComponent,
    RecouvClientCrudComponent,
    RecouvClientEncaissementsComponent,
    RecouvClientFacturesComponent,
    RecouvClientFichesTechniques,
    RecouvClientReleveCompteComponent,
    RecouvClientRelancesComponent,
    RecouvClientPromessesComponent,
  ],
  imports: [
    CommonModule,
    FactureRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    ScrollingModule,
    MaterialModule,
    RecouvrementRoutingModule,
  ]
})
export class RecouvrementModule { }
