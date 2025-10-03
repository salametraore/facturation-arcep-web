import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DefaultComponent} from '../shared/components/default/default.component';
import {ClientComponent} from "./client/client.component";
import {CategorieProduitComponent} from "./categorie-produit/categorie-produit.component";
import {CategorieStationComponent} from "./categorie-station/categorie-station.component";
import {GarantieComponent} from "./garantie/garantie.component";
import {ProduitComponent} from "./produit/produit.component";
import {TarifFraisDossierComponent} from "./tarif-frais-dossier/tarif-frais-dossier.component";
import {TarifFraisRedevanceComponent} from "./tarif-frais-redevance/tarif-frais-redevance.component";
import {TarifFrequenceComponent} from "./tarif-frequence/tarif-frequence.component";
import {ZoneCouvertureComponent} from "./zone-couverture/zone-couverture.component";
import {ZonePostaleComponent} from "./zone-postale/zone-postale.component";

const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      {path: 'clients', component: ClientComponent},
      {path: 'categorie-produits', component: CategorieProduitComponent},
      {path: 'categorie-stations', component: CategorieStationComponent},
      {path: 'garanties', component: GarantieComponent},
      {path: 'produits', component: ProduitComponent},
      {path: 'tarif-frais-dossiers', component: TarifFraisDossierComponent},
      {path: 'tarif-frais-redevances', component: TarifFraisRedevanceComponent},
      {path: 'tarif-frequences', component: TarifFrequenceComponent},
      {path: 'zone-couvertures', component: ZoneCouvertureComponent},
      {path: 'zone-postales', component: ZonePostaleComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class ParametreRoutingModule {
}
