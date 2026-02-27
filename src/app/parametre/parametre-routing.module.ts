import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DefaultComponent} from '../shared/components/default/default.component';

import {CategorieProduitComponent} from "./categorie-produit/categorie-produit.component";
import {CategorieStationComponent} from "./categorie-station/categorie-station.component";
import {GarantieComponent} from "./garantie/garantie.component";
import {ProduitComponent} from "./produit/produit.component";
import {TarifFraisDossierComponent} from "./tarif-frais-dossier/tarif-frais-dossier.component";
import {TarifRedevanceGestionComponent} from "./tarif-redevance-gestion/tarif-redevance-gestion.component";
import {ReglesTarifFrequenceComponent} from "./regles-tarif-frequence/regles-tarif-frequence.component";
import {ZoneCouvertureComponent} from "./zone-couverture/zone-couverture.component";
import {StatutFicheTechniqueComponent} from "./statut-fiche-technique/statut-fiche-technique.component";
import {RolesPageComponent} from "./roles/roles-page/roles-page.component";
import {ClientsComponent} from "./clients/clients.component";
import {ClientsCrudComponent} from "./clients/clients-crud/clients-crud.component";
import {ParametresApplicatifsComponent} from "./parametres-applicatifs/parametres-applicatifs.component";
import {TypeDirection} from "../shared/models/typeDirection";
import {TypeDirectionComponent} from "./type-direction/type-direction.component";
import {DirectionComponent} from "./direction/direction.component";
import {TypeStationsComponent} from "./type-stations/type-stations.component";
import {TypeCanauxComponent} from "./type-canaux/type-canaux.component";
import {TypeBandesFrequenceComponent} from "./type-bandes-frequence/type-bandes-frequence.component";
import {ClasseDebitComponent} from "./classe-debit/classe-debit.component";
import {ClassePuissanceComponent} from "./classe-puissance/classe-puissance.component";
import {ClasseLargeurBandeComponent} from "./classe-largeur-bande/classe-largeur-bande.component";
import {UtilisateursComponent} from "./utilisateurs/utilisateurs.component";
import {UtilisateursExternesComponent} from "./utilisateurs-externes/utilisateurs-externes.component";


const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [

      {path: 'categorie-produits', component: CategorieProduitComponent},
      {path: 'categorie-stations', component: CategorieStationComponent},
      {path: 'garanties', component: GarantieComponent},
      {path: 'produits', component: ProduitComponent},

      {path: 'zone-couverture', component: ZoneCouvertureComponent},
      {path: 'statut-fiche-technique', component: StatutFicheTechniqueComponent},

      {path: 'roles-page', component: RolesPageComponent},
      {path: 'utilisateurs', component: UtilisateursComponent},
      {path: 'utilisateurs-externes', component: UtilisateursExternesComponent},

      { path: 'clients', component: ClientsComponent },
      { path: 'clients/new', component: ClientsCrudComponent },
      { path: 'clients/:id', component: ClientsCrudComponent },
      {path: 'parametres-applicatifs', component: ParametresApplicatifsComponent},
      {path: 'type-directions', component:TypeDirectionComponent },
      {path: 'directions', component: DirectionComponent},

      {path: 'type-stations', component:TypeStationsComponent },
      {path: 'type-canaux', component:TypeCanauxComponent },
      {path: 'type-bandes-frequence', component:TypeBandesFrequenceComponent },
      {path: 'classe-debit', component: ClasseDebitComponent},
      {path: 'classe-puissance', component: ClassePuissanceComponent},
      {path: 'classe-largeur-bande', component: ClasseLargeurBandeComponent},

      {path: 'tarif-frais-dossiers', component: TarifFraisDossierComponent},
      {path: 'tarif-redevances-gestion', component: TarifRedevanceGestionComponent},
      {path: 'regles-tarif-frequences', component: ReglesTarifFrequenceComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class ParametreRoutingModule {
}
