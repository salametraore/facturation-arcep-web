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
import {FicherTechniqueDfcComponent} from "./gestion-prestations-diverses/ficher-technique-dfc.component";
import {ServiceAValeurAjouteComponent} from "./service-a-valeur-ajoute/service-a-valeur-ajoute.component";
import {AutorisationGeneraleComponent} from "./autorisation-generale/autorisation-generale.component";
 import {AgrementInstalleurComponent} from "./agrement-installeur/agrement-installeur.component";
 import {NumerotationComponent} from "./numerotation/numerotation.component";
 import {AgrementEquipementComponent} from "./agrement-equipement/agrement-equipement.component";
 import {DomaineComponent} from "./domaine/domaine.component";
 import {ServiceConfianceComponent} from "./service-confiance/service-confiance.component";
 import {GenerationRedevanceComponent} from "./generation-redevance/generation-redevance.component";
 import {FrequencesComponent} from "./frequences/frequences.component";
 import {ClientDirectionTechniqueComponent} from "./client-direction-technique/client-direction-technique.component";
 import {ClientPage} from "./client-dt/client";
 import {ClientDetailPage} from "./client-dt/client-detail";
 import {ClientResolver} from "./client-direction-technique/client-details/client.resolver";
 import {GestionDevisComponent} from "./gestion-devis/gestion-devis.component";
 import {ClientDetailsComponent} from "./client-direction-technique/client-details/client-details.component";
 import {ClientCrudPrestationsDiversesComponent} from "./client-direction-technique/client-details/client-crud-prestations-diverses/client-crud-prestations-diverses.component";
 import {ClientCrudServiceAValeurAjouteComponent} from "./client-direction-technique/client-details/client-crud-service-a-valeur-ajoute/client-crud-service-a-valeur-ajoute.component";
 import {ClientCrudAutorisationGeneraleComponent} from "./client-direction-technique/client-details/client-crud-autorisation-generale/client-crud-autorisation-generale.component";
 import {ClientCrudAgrementInstalleurComponent} from "./client-direction-technique/client-details/client-crud-agrement-installeur/client-crud-agrement-installeur.component";
 import {ClientCrudAgrementEquipementComponent} from "./client-direction-technique/client-details/client-crud-agrement-equipement/client-crud-agrement-equipement.component";
 import {ClientCrudNumerotationComponent} from "./client-direction-technique/client-details/client-crud-numerotation/client-crud-numerotation.component";

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
      {path: 'gestion-devis', component: GestionDevisComponent},
      {path: 'prestations-divers', component: FicherTechniqueDfcComponent},
      {path: 'service-a-valeur-ajoute', component: ServiceAValeurAjouteComponent},
      {path: 'autorisation-generale', component: AutorisationGeneraleComponent},
      {path: 'agrement-installeur', component:AgrementInstalleurComponent},
      {path: 'numerotation', component:NumerotationComponent},
      {path: 'agrement-equipement', component:AgrementEquipementComponent},
      {path: 'frequences', component:FrequencesComponent},
      {path: 'client-dt', component:ClientPage},
      {path: 'client-dt-detail/:id', component:ClientDetailPage, resolve: { client: ClientResolver }},
      {path: 'client-direction-technique', component:ClientDirectionTechniqueComponent},
      {path: 'client-direction-technique-detail/:id', component:ClientDetailsComponent, resolve: { client: ClientResolver }},
      {path: 'client-crud-prestations-diverses/:clientId', component: ClientCrudPrestationsDiversesComponent },
      {path: 'client-crud-service-a-valeur-ajoute/:clientId', component: ClientCrudServiceAValeurAjouteComponent },
      {path: 'client-crud-numerotation/:clientId', component: ClientCrudNumerotationComponent },
      {path: 'client-crud-autorisation-generale/:clientId', component: ClientCrudAutorisationGeneraleComponent },
      {path: 'client-crud-agrement-installeur/:clientId', component: ClientCrudAgrementInstalleurComponent },
      {path: 'client-crud-agrement-equipement/:clientId', component: ClientCrudAgrementEquipementComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactureRoutingModule { }
