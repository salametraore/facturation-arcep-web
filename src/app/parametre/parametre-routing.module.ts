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
import { withAccess } from '../authentication/route-access.helper';

const routes: Routes = [
  {
    path: '', component: DefaultComponent,
    children: [
      withAccess('parametre/categorie-produits', { path: 'categorie-produits', component: CategorieProduitComponent }),
      { path: 'categorie-stations', component: CategorieStationComponent },
      { path: 'garanties', component: GarantieComponent },
      withAccess('parametre/produits', { path: 'produits', component: ProduitComponent }),

      withAccess('parametre/zone-couverture', { path: 'zone-couverture', component: ZoneCouvertureComponent }),
      withAccess('parametre/statut-fiche-technique', { path: 'statut-fiche-technique', component: StatutFicheTechniqueComponent }),

      withAccess('parametre/roles-page', { path: 'roles-page', component: RolesPageComponent }),
      withAccess('parametre/utilisateurs', { path: 'utilisateurs', component: UtilisateursComponent }),
      withAccess('parametre/utilisateurs-externes', { path: 'utilisateurs-externes', component: UtilisateursExternesComponent }),

      withAccess('parametre/clients', { path: 'clients', component: ClientsComponent }),
      withAccess('parametre/clients/new', { path: 'clients/new', component: ClientsCrudComponent }),
      withAccess('parametre/clients/:id', { path: 'clients/:id', component: ClientsCrudComponent }),

      withAccess('parametre/parametres-applicatifs', { path: 'parametres-applicatifs', component: ParametresApplicatifsComponent }),
      withAccess('parametre/type-directions', { path: 'type-directions', component: TypeDirectionComponent }),
      withAccess('parametre/directions', { path: 'directions', component: DirectionComponent }),

      withAccess('parametre/type-stations', { path: 'type-stations', component: TypeStationsComponent }),
      withAccess('parametre/type-canaux', { path: 'type-canaux', component: TypeCanauxComponent }),
      withAccess('parametre/type-bandes-frequence', { path: 'type-bandes-frequence', component: TypeBandesFrequenceComponent }),
      withAccess('parametre/classe-debit', { path: 'classe-debit', component: ClasseDebitComponent }),
      withAccess('parametre/classe-puissance', { path: 'classe-puissance', component: ClassePuissanceComponent }),
      withAccess('parametre/classe-largeur-bande', { path: 'classe-largeur-bande', component: ClasseLargeurBandeComponent }),

      withAccess('parametre/tarif-frais-dossiers', { path: 'tarif-frais-dossiers', component: TarifFraisDossierComponent }),
      withAccess('parametre/tarif-redevances-gestion', { path: 'tarif-redevances-gestion', component: TarifRedevanceGestionComponent }),
      withAccess('parametre/regles-tarif-frequences', { path: 'regles-tarif-frequences', component: ReglesTarifFrequenceComponent }),
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametreRoutingModule {
}
