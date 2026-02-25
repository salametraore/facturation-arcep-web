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
  TarifRedevanceGestionCrudComponent
} from "./tarif-redevance-gestion/tarif-redevance-gestion-crud/tarif-redevance-gestion-crud.component";
import {TarifRedevanceGestionComponent} from "./tarif-redevance-gestion/tarif-redevance-gestion.component";
import {ReglesTarifFrequenceCrudComponent} from "./regles-tarif-frequence/regles-tarif-frequence-crud/regles-tarif-frequence-crud.component";
import {ReglesTarifFrequenceComponent} from "./regles-tarif-frequence/regles-tarif-frequence.component";
import {ZoneCouvertureCrudComponent} from "./zone-couverture/zone-couverture-crud/zone-couverture-crud.component";
import {StatutFicheTechniqueCrudComponent} from "./statut-fiche-technique/statut-fiche-technique-crud/statut-fiche-technique-crud.component";
import {StatutFicheTechniqueComponent} from "./statut-fiche-technique/statut-fiche-technique.component";
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
import {TypeStationsCrudComponent} from "./type-stations/type-stations-crud/type-stations-crud.component";
import {TypeStationsComponent} from "./type-stations/type-stations.component";
import {TypeCanauxCrudComponent} from "./type-canaux/type-canaux-crud/type-canaux-crud.component";
import {TypeCanauxComponent} from "./type-canaux/type-canaux.component";
import {TypeBandesFrequenceComponent} from "./type-bandes-frequence/type-bandes-frequence.component";
import {TypeBandesFrequenceCrudComponent} from "./type-bandes-frequence/type-bandes-frequence-crud/type-bandes-frequence-crud.component";
import {ClasseDebitComponent} from "./classe-debit/classe-debit.component";
import {ClasseDebitCrudComponent} from "./classe-debit/classe-debit-crud/classe-debit-crud.component";
import {ClassePuissanceComponent} from "./classe-puissance/classe-puissance.component";
import {ClassePuissanceCrudComponent} from "./classe-puissance/classe-puissance-crud/classe-puissance-crud.component";
import {ClasseLargeurBandeComponent} from "./classe-largeur-bande/classe-largeur-bande.component";
import {ClasseLargeurBandeCrudComponent} from "./classe-largeur-bande/classe-largeur-bande-crud/classe-largeur-bande-crud.component";
import {UtilisateursComponent} from "./utilisateurs/utilisateurs.component";
import {UtilisateursCrudComponent} from "./utilisateurs/utilisateurs-crud/utilisateurs-crud.component";
import {UtilisateursExternesComponent} from "./utilisateurs-externes/utilisateurs-externes.component";
import {UtilisateursExternesCrudComponent} from "./utilisateurs-externes/utilisateurs-externes-crud/utilisateurs-externes-crud.component";

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
    TarifRedevanceGestionCrudComponent,
    TarifRedevanceGestionComponent,
    ReglesTarifFrequenceCrudComponent,
    ReglesTarifFrequenceComponent,
    ZoneCouvertureCrudComponent,
    StatutFicheTechniqueCrudComponent,
    StatutFicheTechniqueComponent,
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
    TypeStationsCrudComponent,
    TypeCanauxCrudComponent,
    TypeStationsComponent,
    TypeCanauxComponent,
    TypeBandesFrequenceComponent,
    TypeBandesFrequenceCrudComponent,
    ClasseDebitComponent,
    ClasseDebitCrudComponent,
    ClassePuissanceComponent,
    ClassePuissanceCrudComponent,
    ClasseLargeurBandeComponent,
    ClasseLargeurBandeCrudComponent,
    UtilisateursComponent,
    UtilisateursCrudComponent,
    UtilisateursExternesComponent,
    UtilisateursExternesCrudComponent,
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
