 import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DefaultComponent} from "../shared/components/default/default.component";
import {FactureComponent} from "./facture/facture.component";
import {FactureDfcComponent} from "./facture-dfc/facture-dfc.component";
import {
  FactureSanctionFinanciereDetailDapComponent
} from "./facture-sanction-financiere-detail-dap/facture-sanction-financiere-detail-dap.component";
import {FactureDetailDfcEnergieComponent} from "./facture-detail-dfc-energie/facture-detail-dfc-energie.component";
import {
  FactureDetailDfcElectriciteComponent
} from "./facture-detail-dfc-electricite/facture-detail-dfc-electricite.component";
import {FicheTechniqueDgsnComponent} from "./fiche-technique-dgsn/fiche-technique-dgsn.component";
import {FactureRecuDgsnComponent} from "./facture-recu-dgsn/facture-recu-dgsn.component";
import {FactureRecuDsiComponent} from "./facture-recu-dsi/facture-recu-dsi.component";
import {FactureRecuDfcComponent} from "./facture-recu-dfc/facture-recu-dfc.component";
import {EncaissementComponent} from "./encaissement/encaissement.component";
import {DevisFactureComponent} from "./devis-facture/devis-facture.component";
import {ElementsFactureRecuComponent} from "./elements-facture-recu/elements-facture-recu.component";
import {FicherTechniqueDfcComponent} from "./ficher-technique-dfc/ficher-technique-dfc.component";
import {ServiceAValeurAjouteComponent} from "./service-a-valeur-ajoute/service-a-valeur-ajoute.component";
import {AutorisationGeneraleComponent} from "./autorisation-generale/autorisation-generale.component";
 import {AgrementInstalleurComponent} from "./agrement-installeur/agrement-installeur.component";
 import {NumerotationComponent} from "./numerotation/numerotation.component";
 import {AgrementEquipementComponent} from "./agrement-equipement/agrement-equipement.component";
 import {DomaineComponent} from "./domaine/domaine.component";
 import {ServiceConfianceComponent} from "./service-confiance/service-confiance.component";
 import {GenerationRedevanceComponent} from "./generation-redevance/generation-redevance.component";

const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      {path: '', component: FactureComponent},
      {path: 'domaines', component: DomaineComponent},
      {path: 'service-confiance', component: ServiceConfianceComponent},
      {path: 'factures', component: FactureComponent},
      {path: 'facture-dfc', component: FactureDfcComponent},
      {path: 'facture-detail-dfc-energie', component: FactureDetailDfcEnergieComponent},
      {path: 'facture-detail-dfc-electricite', component: FactureDetailDfcElectriciteComponent},
      {path: 'facture-sanction-financiere-detail-dap', component: FactureSanctionFinanciereDetailDapComponent},
      {path: 'fiche-technique-dgsn', component: FicheTechniqueDgsnComponent},
      {path: 'facture-recu-dgsn', component: FactureRecuDgsnComponent},
      {path: 'facture-recu-dsi', component: FactureRecuDsiComponent},
      {path: 'elements-recu-dsi', component: ElementsFactureRecuComponent},
      {path: 'facture-recu-dfc', component: FactureRecuDfcComponent},
      {path: 'encaissement', component: EncaissementComponent},
      {path: 'devis-facure', component: DevisFactureComponent},
      {path: 'prestations-divers', component: FicherTechniqueDfcComponent},
      {path: 'service-a-valeur-ajoute', component: ServiceAValeurAjouteComponent},
      {path: 'autorisation-generale', component: AutorisationGeneraleComponent},
      {path: 'agrement-installeur', component:AgrementInstalleurComponent},
      {path: 'numerotation', component:NumerotationComponent},
      {path: 'agrement-equipement', component:AgrementEquipementComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactureRoutingModule { }
