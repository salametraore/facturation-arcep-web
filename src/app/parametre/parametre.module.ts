import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParametreRoutingModule} from './parametre-routing.module';
import {SharedModule} from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {DomaineComponent} from "./domaine/domaine.component";
import {DomaineCrudComponent} from "./domaine/domaine-crud/domaine-crud.component";
import {ServiceConfianceComponent} from "./service-confiance/service-confiance.component";
import {
  ServiceConfianceCrudComponent
} from "./service-confiance/service-confiance-crud/service-confiance-crud.component";
import {ClientComponent} from "./client/client.component";
import {ClientCrudComponent} from "./client/client-crud/client-crud.component";
import {ClientTablesComponent} from "./client/client-tables/client-tables.component";
import {ClientRelancesComponent} from "./client/client-tables/client-relances/client-relances.component";
import {ClientReleveCompteComponent} from "./client/client-tables/client-releve-compte/client-releve-compte.component";
import {ClientPromessesComponent} from "./client/client-tables/client-promesses/client-promesses.component";
import {ClientFacturesComponent} from "./client/client-tables/client-factures/client-factures.component";
import {ClientEncaissementsComponent} from "./client/client-tables/client-encaissements/client-encaissements.component";
import {ClientAvancesComponent} from "./client/client-tables/client-avances/client-avances.component";
import {CategorieProduitComponent} from "./categorie-produit/categorie-produit.component";
import {
  CategorieProduitCrudComponent
} from "./categorie-produit/categorie-produit-crud/categorie-produit-crud.component";
import {
  CategorieStationCrudComponent
} from "./categorie-station/categorie-station-crud/categorie-station-crud.component";
import {GarantieComponent} from "./garantie/garantie.component";
import {GarantieCrudComponent} from "./garantie/garantie-crud/garantie-crud.component";
import {ProduitCrudComponent} from "./produit/produit-crud/produit-crud.component";
import {ProduitComponent} from "./produit/produit.component";
import {
  TarifFraisDossierCrudComponent
} from "./tarif-frais-dossier/tarif-frais-dossier-crud/tarif-frais-dossier-crud.component";
import {TarifFraisDossierComponent} from "./tarif-frais-dossier/tarif-frais-dossier.component";
import {
  TarifFraisRedevanceCrudComponent
} from "./tarif-frais-redevance/tarif-frais-redevance-crud/tarif-frais-redevance-crud.component";
import {TarifFraisRedevanceComponent} from "./tarif-frais-redevance/tarif-frais-redevance.component";
import {TarifFrequenceCrudComponent} from "./tarif-frequence/tarif-frequence-crud/tarif-frequence-crud.component";
import {TarifFrequenceComponent} from "./tarif-frequence/tarif-frequence.component";
import {ZoneCouvertureCrudComponent} from "./zone-couverture/zone-couverture-crud/zone-couverture-crud.component";
import {ZonePostaleCrudComponent} from "./zone-postale/zone-postale-crud/zone-postale-crud.component";
import {ZonePostaleComponent} from "./zone-postale/zone-postale.component";
import {ZoneCouvertureComponent} from "./zone-couverture/zone-couverture.component";
import {CategorieStationComponent} from "./categorie-station/categorie-station.component";

@NgModule({
  declarations: [
    DomaineComponent,
    DomaineCrudComponent,
    ServiceConfianceComponent,
    ServiceConfianceCrudComponent,
    ClientComponent,
    ClientCrudComponent,
    ClientTablesComponent,
    ClientRelancesComponent,
    ClientReleveCompteComponent,
    ClientPromessesComponent,
    ClientFacturesComponent,
    ClientEncaissementsComponent,
    ClientAvancesComponent,
    CategorieProduitComponent,
    CategorieProduitCrudComponent,
    CategorieStationCrudComponent,
    GarantieComponent,
    GarantieCrudComponent,
    ProduitCrudComponent,
    ProduitComponent,
    TarifFraisDossierCrudComponent,
    TarifFraisDossierComponent,
    TarifFraisRedevanceCrudComponent,
    TarifFraisRedevanceComponent,
    TarifFrequenceCrudComponent,
    TarifFrequenceComponent,
    ZoneCouvertureCrudComponent,
    ZonePostaleCrudComponent,
    ZonePostaleComponent,
    ZoneCouvertureComponent,
    CategorieStationComponent
  ],
  imports: [
    CommonModule,
    ParametreRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
  ]
})
export class ParametreModule {
}
