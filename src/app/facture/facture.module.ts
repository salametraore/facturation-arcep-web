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
import {FicherTechniqueDfcComponent} from "./ficher-technique-dfc/ficher-technique-dfc.component";
import {
  FicherTechniqueDfcCrudComponent
} from "./ficher-technique-dfc/ficher-technique-dfc-crud/ficher-technique-dfc-crud.component";
import {
  FicheTechniqueDfcTableComponent
} from "./ficher-technique-dfc/fiche-technique-dfc-table/fiche-technique-dfc-table.component";
import {ServiceAValeurAjouteComponent} from "./service-a-valeur-ajoute/service-a-valeur-ajoute.component";
import {
  ServiceAValeurAjouteTableComponent
} from "./service-a-valeur-ajoute/service-a-valeur-ajoute-table/service-a-valeur-ajoute-table.component";
import {
  ServiceAValeurAjouteCrudComponent
} from "./service-a-valeur-ajoute/service-a-valeur-ajoute-crud/service-a-valeur-ajoute-crud.component";
import {AutorisationGeneraleComponent} from "./autorisation-generale/autorisation-generale.component";
import {
  AutorisationGeneraleTableComponent
} from "./autorisation-generale/autorisation-generale-table/autorisation-generale-table.component";
import {
  AutorisationGeneraleCrudComponent
} from "./autorisation-generale/autorisation-generale-crud/autorisation-generale-crud.component";
import { AgrementInstalleurComponent } from './agrement-installeur/agrement-installeur.component';
import { AgrementInstalleurCrudComponent } from './agrement-installeur/agrement-installeur-crud/agrement-installeur-crud.component';
import { AgrementInstalleurTableComponent } from './agrement-installeur/agrement-installeur-table/agrement-installeur-table.component';
import { NumerotationComponent } from './numerotation/numerotation.component';
import { NumerotationTableComponent } from './numerotation/numerotation-table/numerotation-table.component';
import { NumerotationCrudComponent } from './numerotation/numerotation-crud/numerotation-crud.component';
import { AgrementEquipementComponent } from './agrement-equipement/agrement-equipement.component';
import { AgrementEquipementTableComponent } from './agrement-equipement/agrement-equipement-table/agrement-equipement-table.component';
import { AgrementEquipementCrudComponent } from './agrement-equipement/agrement-equipement-crud/agrement-equipement-crud.component';
import {DomaineComponent} from "./domaine/domaine.component";
import {DomaineCrudComponent} from "./domaine/domaine-crud/domaine-crud.component";
import {ServiceConfianceComponent} from "./service-confiance/service-confiance.component";
import {
  ServiceConfianceCrudComponent
} from "./service-confiance/service-confiance-crud/service-confiance-crud.component";
import {AvisEtuteTechniqueDialodComponent} from "./avis-etute-technique-dialod/avis-etute-technique-dialod.component";
import {HistoriqueTraitementComponent} from "./historique-traitement/historique-traitement.component";
import {AvisTechniqueInfosComponent} from "./avis-technique-infos/avis-technique-infos.component";
import { EncaissementDirectComponent } from './encaissement-direct/encaissement-direct.component';
import { EncaissementDirectCrudComponent } from './encaissement-direct/encaissement-direct-crud/encaissement-direct-crud.component';
import {GenerationRedevanceComponent} from "./generation-redevance/generation-redevance.component";
import {GenerationRedevanceCrudComponent} from "./generation-redevance/generation-redevance-crud/generation-redevance-crud.component";
import {RetraitAutorisationDialogComponent} from "./retrait-autorisation-dialog/retrait-autorisation-dialog.component";
import {FrequencesComponent} from "./frequences/frequences.component";
import {FrequencesTableComponent} from "./frequences/frequences-table/frequences-table.component";
import {FrequencesCrudComponent} from "./frequences/frequences-crud/frequences-crud.component";
import { ScrollingModule } from '@angular/cdk/scrolling'
import {ClientDirectionTechniqueComponent} from "./client-direction-technique/client-direction-technique.component";
import {ClientDetailsComponent} from "./client-direction-technique/client-details/client-details.component";
import {ClientDetailsReleveCompteComponent} from "./client-direction-technique/client-details/client-details-releve-compte/client-details-releve-compte.component";
import {ClientDetailsEncaissementsComponent} from "./client-direction-technique/client-details/client-details-encaissements/client-details-encaissements.component";
import {ClientDetailsFacturesComponent} from "./client-direction-technique/client-details/client-details-factures/client-details-factures.component";
import {ClientDetailsFichesTechniques} from "./client-direction-technique/client-details/client-details-fiches-techniques/client-details-fiches-techniques";


import { MaterialModules } from '../material-modules';


@NgModule({
  declarations: [
    DomaineComponent,
    DomaineCrudComponent,
    ServiceConfianceComponent,
    ServiceConfianceCrudComponent,
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
    ElementsFactureRecuCrudComponent,
    FicherTechniqueDfcComponent,
    FicherTechniqueDfcCrudComponent,
    FicheTechniqueDfcTableComponent,
    ServiceAValeurAjouteComponent,
    ServiceAValeurAjouteTableComponent,
    ServiceAValeurAjouteCrudComponent,
    AutorisationGeneraleComponent,
    AutorisationGeneraleTableComponent,
    AutorisationGeneraleCrudComponent,
    AgrementInstalleurComponent,
    AgrementInstalleurCrudComponent,
    AgrementInstalleurTableComponent,
    NumerotationComponent,
    NumerotationTableComponent,
    NumerotationCrudComponent,
    AgrementEquipementComponent,
    AgrementEquipementTableComponent,
    AgrementEquipementCrudComponent,
    AvisEtuteTechniqueDialodComponent,
    HistoriqueTraitementComponent,
    AvisTechniqueInfosComponent,
    EncaissementDirectComponent,
    EncaissementDirectCrudComponent,
    GenerationRedevanceComponent,
    GenerationRedevanceCrudComponent,
    RetraitAutorisationDialogComponent,
    FrequencesComponent,
    FrequencesTableComponent,
    FrequencesCrudComponent,
    ClientDirectionTechniqueComponent,
    ClientDetailsComponent,
    ClientDetailsReleveCompteComponent,
    ClientDetailsEncaissementsComponent,
    ClientDetailsFacturesComponent,
    ClientDetailsFichesTechniques,
  ],
  imports: [
    CommonModule,
    MaterialModules,
    FactureRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    ScrollingModule,
  ] ,

})
export class FactureModule { }
