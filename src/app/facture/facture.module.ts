import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FactureRoutingModule } from './facture-routing.module';
import {FactureComponent} from "./facture/facture.component";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {FactureDfcComponent} from "./facture-dfc/facture-dfc.component";
import {FactureDetailDfcEnergieComponent} from "./facture-detail-dfc-energie/facture-detail-dfc-energie.component";
import {
  FactureDetailDfcElectriciteComponent
} from "./facture-detail-dfc-electricite/facture-detail-dfc-electricite.component";
import {
  FactureSanctionFinanciereDetailDapComponent
} from "./facture-sanction-financiere-detail-dap/facture-sanction-financiere-detail-dap.component";
import {FicheTechniqueDgsnComponent} from "./fiche-technique-dgsn/fiche-technique-dgsn.component";
import {FactureRecuDgsnComponent} from "./facture-recu-dgsn/facture-recu-dgsn.component";
import {FactureRecuDsiComponent} from "./facture-recu-dsi/facture-recu-dsi.component";
import {FactureRecuDfcComponent} from "./facture-recu-dfc/facture-recu-dfc.component";
import {FactureRecuDfcCrudComponent} from "./facture-recu-dfc/facture-recu-dfc-crud/facture-recu-dfc-crud.component";
import {EncaissementComponent} from "./encaissement/encaissement.component";
import {EncaissementCrudComponent} from "./encaissement/encaissement-crud/encaissement-crud.component";
import {DevisFactureComponent} from "./devis-facture/devis-facture.component";
import {DevisFactureCrudComponent} from "./devis-facture/devis-facture-crud/devis-facture-crud.component";
import {ElementsFactureRecuComponent} from "./elements-facture-recu/elements-facture-recu.component";
import {
  ElementsFactureRecuCrudComponent
} from "./elements-facture-recu/elements-facture-recu-crud/elements-facture-recu-crud.component";


@NgModule({
  declarations: [
    FactureComponent,
    FactureDfcComponent,
    FactureDetailDfcEnergieComponent,
    FactureDetailDfcElectriciteComponent,
    FactureSanctionFinanciereDetailDapComponent,
    FicheTechniqueDgsnComponent,
    FactureRecuDgsnComponent,
    FactureRecuDsiComponent,
    FactureRecuDfcComponent,
    FactureRecuDfcCrudComponent,
    EncaissementComponent,
    EncaissementCrudComponent,
    DevisFactureComponent,
    DevisFactureCrudComponent,
    ElementsFactureRecuComponent,
    ElementsFactureRecuCrudComponent
  ],
  imports: [
    CommonModule,
    FactureRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
  ]
})
export class FactureModule { }
