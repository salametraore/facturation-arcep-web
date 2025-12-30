import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DefaultComponent} from '../shared/components/default/default.component';

import {CategorieProduitComponent} from "./categorie-produit/categorie-produit.component";
import {CategorieStationComponent} from "./categorie-station/categorie-station.component";
import {GarantieComponent} from "./garantie/garantie.component";
import {ProduitComponent} from "./produit/produit.component";
import {TarifFraisDossierComponent} from "./tarif-frais-dossier/tarif-frais-dossier.component";
import {TarifFraisRedevanceComponent} from "./tarif-frais-redevance/tarif-frais-redevance.component";
import {TarifFrequenceComponent} from "./tarif-frequence/tarif-frequence.component";
import {ZoneCouvertureComponent} from "./zone-couverture/zone-couverture.component";
import {ZonePostaleComponent} from "./zone-postale/zone-postale.component";
import {RolesPageComponent} from "./roles/roles-page/roles-page.component";
import {ClientsComponent} from "./clients/clients.component";
import {ClientsCrudComponent} from "./clients/clients-crud/clients-crud.component";
import {ParametresApplicatifsComponent} from "./parametres-applicatifs/parametres-applicatifs.component";
import {TypeDirection} from "../shared/models/typeDirection";
import {TypeDirectionComponent} from "./type-direction/type-direction.component";
import {DirectionComponent} from "./direction/direction.component";

const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [

      {path: 'categorie-produits', component: CategorieProduitComponent},
      {path: 'categorie-stations', component: CategorieStationComponent},
      {path: 'garanties', component: GarantieComponent},
      {path: 'produits', component: ProduitComponent},
      {path: 'tarif-frais-dossiers', component: TarifFraisDossierComponent},
      {path: 'tarif-frais-redevances', component: TarifFraisRedevanceComponent},
      {path: 'tarif-frequences', component: TarifFrequenceComponent},
      {path: 'zone-couvertures', component: ZoneCouvertureComponent},
      {path: 'zone-postales', component: ZonePostaleComponent},
      {path: 'roles-page', component: RolesPageComponent},
      // ✅ Clients
      { path: 'clients', component: ClientsComponent },
      { path: 'clients/new', component: ClientsCrudComponent },
      { path: 'clients/:id', component: ClientsCrudComponent },
      {path: 'parametres-applicatifs', component: ParametresApplicatifsComponent},
      {path: 'type-directions', component:TypeDirectionComponent },
      {path: 'directions', component: DirectionComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class ParametreRoutingModule {
}
