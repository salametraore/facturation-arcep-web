import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParametreRoutingModule} from './parametre-routing.module';
import {SharedModule} from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { MatPaginatorModule } from '@angular/material/paginator';

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
import {RoleCrudComponent} from "./roles/role-crud/role-crud.component";
import {RolesPageComponent} from "./roles/roles-page/roles-page.component";
import {ClientsComponent} from "./clients/clients.component";
import {ClientsCrudComponent} from "./clients/clients-crud/clients-crud.component";
import {ParametresApplicatifsComponent} from "./parametres-applicatifs/parametres-applicatifs.component";
import {ParametresApplicatifsCrudComponent} from "./parametres-applicatifs/parametres-applicatifs-crud/parametres-applicatifs-crud.component";
import {TypeDirectionCrudComponent} from "./type-direction/type-direction-crud/type-direction-crud.component";
import {TypeDirectionComponent} from "./type-direction/type-direction.component";
import {DirectionComponent} from "./direction/direction.component";
import {DirectionCrudComponent} from "./direction/direction-crud/direction-crud.component";

@NgModule({
  declarations: [
    // DomaineComponent,
    // FichesTechniquesDapCrudComponent,
    // ServiceConfianceComponent,
    // ServiceConfianceCrudComponent,
    ClientsComponent,
    ClientsCrudComponent,
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
    CategorieStationComponent,
    RolesPageComponent,
    RoleCrudComponent,
    ParametresApplicatifsComponent,
    ParametresApplicatifsCrudComponent,
    TypeDirectionComponent,
    TypeDirectionCrudComponent,
    DirectionComponent,
    DirectionCrudComponent,
  ],
  imports: [
    CommonModule,
    ParametreRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    MatPaginatorModule,
  ]
})
export class ParametreModule {
}
