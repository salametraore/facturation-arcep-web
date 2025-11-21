// src/app/facture/frequences/frequences-crud/frequences-crud.component.ts

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { MatTable } from '@angular/material/table';

import { FicheTechniques } from '../../../shared/models/ficheTechniques';

import { CategoryId } from '../../../shared/models/frequences-category.types';
import {
  StationEquipementRequest,
  StationCanalRequest,
  FicheTechniqueFrequenceRequest
} from '../../../shared/models/fiche-technique-frequence';

import {
  buildFicheTechniqueFrequenceForm,
  buildStationEquipementFG,
  buildStationCanalFG,
  getStationsEquipFA,
  getStationsCanalFA,
  formToFicheTechniqueFrequenceRequest
} from '../forms/frequences.form';

import { CATEGORY_CONFIG } from '../config/frequences-category.config';

import { FichesTechniquesFrequenceService } from '../../../shared/services/fiches-techniques-frequences';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { operations } from '../../../constantes';

import {
  StationFrequencesDialogComponent,
  StationDialogData
} from '../modals/station-frequences-dialog/station-frequences-dialog.component';

import {
  CanalFrequencesDialogComponent,
  CanalDialogData
} from '../modals/canal-frequences-dialog/canal-frequences-dialog.component';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { StatutFicheTechnique } from '../../../shared/models/statut-fiche-technique';
import { Client } from '../../../shared/models/client';
import { Produit } from '../../../shared/models/produit';
import { HistoriqueFicheTechnique } from '../../../shared/models/historique-traitement-fiche-technique';
import { FicheTechniquesService } from '../../../shared/services/fiche-techniques.service';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { ProduitService } from '../../../shared/services/produits.service';
import { ClientService } from '../../../shared/services/client.service';
import { StatutFicheTechniqueService } from '../../../shared/services/statut-fiche-technique.service';
import { TypeBandeFrequenceList } from '../../../shared/models/typeBandeFrequenceList';
import { TypeCanalList } from '../../../shared/models/typeCanalList';
import { TypeStation } from '../../../shared/models/type-station';
import { TypeBandesFrequenceService } from '../../../shared/services/type-bandes-frequence.service';
import { TypeStationService } from '../../../shared/services/type-station.service';
import { TypeCanauxService } from '../../../shared/services/type-canaux.service';
import { ZoneCouverture } from '../../../shared/models/zone-couverture';
import { ZoneCouvertureService } from '../../../shared/services/zone-couverture.service';

@Component({
  selector: 'frequences-crud',
  templateUrl: './frequences-crud.component.html',
  styleUrl: './frequences-crud.component.scss',
})
export class FrequencesCrudComponent implements OnInit {

  @Input() operation: string;
  @Input() ficheTechnique: FicheTechniques;

  @Output() notifyActionOperation = new EventEmitter<string>();
  @Output() notifyFicheTechnique = new EventEmitter<FicheTechniques>();

  // 🔹 Colonnes alignées avec les nouveaux modèles / configs
  displayedColumnsStations: string[] = [
    'type_station',
    'puissance',
    'nbre_station',
    'debit',
    'largeur_bande',
    'largeur_bande_unite',
    'bande_frequence',
    'caractere_commercial',
    'nbre_tranche',
    'localite',
    'actions'
  ];

  displayedColumnsCanaux: string[] = [
    'type_station',
    'type_canal',
    'zone_couverture',
    'nbre_tranche',
    'largeur_bande',
    'largeur_bande_unite',
    'bande_frequence',
    'actions'
  ];

  @ViewChild('stationsTable') stationsTable: MatTable<any>;
  @ViewChild('canauxTable')  canauxTable: MatTable<any>;

  form: FormGroup;

  // catégorie courante, déduite de la fiche (step 1)
  cat: CategoryId = 1 as CategoryId;
  cfg = CATEGORY_CONFIG;

  loading = false;
  errorMsg = '';

  clients: Client[];
  client: Client;
  categories: CategorieProduit[];
  categoriesFiltered: CategorieProduit[];
  categorie: CategorieProduit;
  statutFicheTechniques: StatutFicheTechnique[];
  statutFicheTechnique: StatutFicheTechnique;
  historiqueFicheTechniques: HistoriqueFicheTechnique[];

  typeBandeFrequences: TypeBandeFrequenceList[];
  typeBandeFrequence: TypeBandeFrequenceList;
  typeCanaux: TypeCanalList[];
  tyepCanal: TypeCanalList;
  typeStations: TypeStation[];
  typeStation: TypeStation;
  zoneCouvertures: ZoneCouverture[];
  zoneCouverture: ZoneCouverture;

  // Gestion création / visibilité des steps
  isNew = true;
  showStationsStep = false;
  showCanauxStep = false;
  showTarifsStep = false; // utilisé comme "step 4 : Récap"

  // 🔹 Stepper linéaire uniquement jusqu'à la validation de la fiche
  isLinear = true;

  protected readonly operations = operations;

  constructor(
    private fb: FormBuilder,
    private api: FichesTechniquesFrequenceService,
    private msgService: MsgMessageServiceService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private typeStationService: TypeStationService,
    private typeCanauxService: TypeCanauxService,
    private zoneCouvertureService: ZoneCouvertureService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
  ) {
  }

  // Getters pratiques
  get ficheFG(): FormGroup {
    return this.form.get('fiche') as FormGroup;
  }

  get stationsFA(): FormArray {
    return getStationsEquipFA(this.form);
  }

  get canauxFA(): FormArray {
    return getStationsCanalFA(this.form);
  }

  ngOnInit(): void {
    this.loadData();

    // Cas création
    if (this.operation === operations.create) {
      this.isNew = true;
      this.initCreate();
      return;
    }

    // Cas édition / transmettre : fiche sélectionnée obligatoire
    if (!this.ficheTechnique) {
      this.errorMsg = 'Aucune fiche sélectionnée';
      return;
    }

    this.isNew = false;
    this.initUpdate();
  }

  // ---------- Chargement des référentiels ----------
  loadData(): void {

    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
      this.categoriesFiltered = categories.filter(f => f.id < 8);
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
      this.statutFicheTechnique = statutFicheTechniques.find(st => st.id === 1);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    if (this.ficheTechnique?.id) {
      this.ficheTechniquesService
        .getHistoriqueTraitementFicheTechnique(this.ficheTechnique.id)
        .subscribe((historiqueFicheTechniquesLoc: HistoriqueFicheTechnique[]) => {
          this.historiqueFicheTechniques = historiqueFicheTechniquesLoc;
        });
    } else {
      this.historiqueFicheTechniques = [];
    }

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanalList[]) => {
      this.typeCanaux = listeCanaux;
    });

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = listeTypeStations;
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequenceList[]) => {
      this.typeBandeFrequences = listeTypeBandesFreq;
    });

    this.zoneCouvertureService.getListItems().subscribe((listeZones: ZoneCouverture[]) => {
      this.zoneCouvertures = listeZones;
    });
  }

  // Libellés helpers
  getLibelleTypeCanal(id?: number | null): string {
    if (!id || !this.typeCanaux || this.typeCanaux.length === 0) {
      return '';
    }
    const found = this.typeCanaux.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  getLibelleTypeStation(id?: number | null): string {
    if (!id || !this.typeStations || this.typeStations.length === 0) {
      return '';
    }
    const found = this.typeStations.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  getLibelleTypeBandeFrequence(id?: number | null): string {
    if (!id || !this.typeBandeFrequences || this.typeBandeFrequences.length === 0) {
      return '';
    }
    const found = this.typeBandeFrequences.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  getLibelleZoneCouverture(id?: number | null): string {
    if (!id || !this.zoneCouvertures || this.zoneCouvertures.length === 0) {
      return '';
    }
    const found = this.zoneCouvertures.find(cat => cat.id === id);
    return found?.libelle ?? '';
  }

  getLibelleCategorie(id?: number | null): string {
    if (!id || !this.categoriesFiltered || this.categoriesFiltered.length === 0) {
      return '';
    }
    const found = this.categoriesFiltered.find(c => c.id === id);
    return found?.libelle ?? '';
  }

  onGetClient(item: Client): void {
    this.client = item;
  }

  // ---------- Initialisation création ----------
  private initCreate(): void {
    this.loading = false;
    this.errorMsg = '';

    const ficheFreq: FicheTechniqueFrequenceRequest = {
      client: null,
      categorie_produit: null,
      objet: null,
      commentaire: null,
      direction: null,
      statut: undefined,
      utilisateur: null,
      date_creation: null,
      position: null,
      position_direction: null,
      avis: null,
      date_avis: null,
      duree: null,
      date_fin: null,
      date_debut: null,
      periode: null,
      recurrente: null,
      stations_canal: [],
      stations_equipement: []
    };

    this.form = buildFicheTechniqueFrequenceForm(this.fb, ficheFreq);

    // steps 2–4 invisibles tant que fiche non validée
    this.showStationsStep = false;
    this.showCanauxStep = false;
    this.showTarifsStep = false;

    this.cat = 1 as CategoryId;
    this.updateDisplayedColumns();

    this.ficheFG.get('categorie_produit')?.valueChanges.subscribe(val => {
      if (val != null) {
        this.cat = val as CategoryId;
        this.updateDisplayedColumns();
      }
    });
  }

  // ---------- Initialisation édition ----------
  private initUpdate(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getItem(this.ficheTechnique.id).subscribe({
      next: (fiche: FicheTechniqueFrequenceRequest) => {
        this.cat = (fiche.categorie_produit as CategoryId) || 1;
        this.form = buildFicheTechniqueFrequenceForm(this.fb, fiche);

        // remplir les FormArray avec les stations/canaux existants
        (fiche.stations_equipement || []).forEach((s: StationEquipementRequest) => {
          this.stationsFA.push(buildStationEquipementFG(this.fb, s, this.cat));
        });

        (fiche.stations_canal || []).forEach((c: StationCanalRequest) => {
          this.canauxFA.push(buildStationCanalFG(this.fb, c, this.cat));
        });

        this.loading = false;

        this.updateDisplayedColumns();

        // steps visibles en édition
        this.showStationsStep = true;
        this.showCanauxStep = true;
        this.showTarifsStep = true;

        this.ficheFG.get('categorie_produit')?.valueChanges.subscribe(val => {
          if (val) {
            this.cat = val as CategoryId;
            this.updateDisplayedColumns();
          }
        });
      },
      error: (e) => {
        console.error('GET fiche fréquence failed:', e);
        this.errorMsg = `${e.status} ${e.statusText} — ${e?.error?.detail || e?.message || 'Chargement impossible'}`;
        this.loading = false;
      }
    });
  }

  // ---------- STATIONS : TABLE + MODALE ----------
  onOpenStationDialog(index?: number): void {
    let stationValue: StationEquipementRequest | undefined;

    if (index != null) {
      const fg = this.stationsFA.at(index) as FormGroup;
      stationValue = fg.getRawValue() as StationEquipementRequest;
    }

    const dialogRef = this.dialog.open<
      StationFrequencesDialogComponent,
      StationDialogData,
      StationEquipementRequest
      >(StationFrequencesDialogComponent, {
      width: '800px',
      data: {
        station: stationValue,
        cat: this.cat
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      if (index != null) {
        (this.stationsFA.at(index) as FormGroup).patchValue(result);
      } else {
        this.stationsFA.push(buildStationEquipementFG(this.fb, result, this.cat));
      }
      this.stationsTable?.renderRows();
    });
  }

  onRemoveStation(index: number): void {
    this.dialogService.yes_no({ message: 'Supprimer cette station ?' })
      .subscribe(yes => {
        if (yes) {
          this.stationsFA.removeAt(index);
        }
      });
  }

  // ---------- CANAUX : TABLE + MODALE ----------
  onOpenCanalDialog(index?: number): void {
    let canalValue: StationCanalRequest | undefined;

    if (index != null) {
      const fg = this.canauxFA.at(index) as FormGroup;
      canalValue = fg.getRawValue() as StationCanalRequest;
    }

    const dialogRef = this.dialog.open<
      CanalFrequencesDialogComponent,
      CanalDialogData,
      StationCanalRequest
      >(CanalFrequencesDialogComponent, {
      width: '800px',
      data: {
        canal: canalValue,
        cat: this.cat
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      if (index != null) {
        (this.canauxFA.at(index) as FormGroup).patchValue(result);
      } else {
        this.canauxFA.push(buildStationCanalFG(this.fb, result, this.cat));
      }
      this.canauxTable?.renderRows();
    });
  }

  onRemoveCanal(index: number): void {
    this.dialogService.yes_no({ message: 'Supprimer ce canal ?' })
      .subscribe(yes => {
        if (yes) {
          this.canauxFA.removeAt(index);
        }
      });
  }

  // ---------- VALIDATIONS PAR STEP ----------
  isFicheValid(): boolean {
    return this.ficheFG?.valid;
  }

  isStationsValid(): boolean {
    return this.stationsFA?.valid;
  }

  isCanauxValid(): boolean {
    return this.canauxFA?.valid;
  }

  // ---------- VALIDATION DU STEP 1 (FICHE) ----------
  onFicheStepValidated(): void {
    if (!this.isFicheValid()) {
      this.ficheFG.markAllAsTouched();
      return;
    }

    const catVal = this.ficheFG.get('categorie_produit')?.value;
    if (catVal != null) {
      this.cat = catVal as CategoryId;
      this.updateDisplayedColumns();
    }

    // en création, on ne garde pas d’éventuelles lignes résiduelles
    if (this.isNew) {
      this.stationsFA.clear();
      this.canauxFA.clear();
    }

    this.showStationsStep = true;
    this.showCanauxStep = true;
    this.showTarifsStep = true;

    this.isLinear = false;
  }

  // ---------- SAUVEGARDE SIMPLE (pas de lignes tarifées) ----------
  onSave(): void {

    if (!this.form || this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Formulaire incomplet ou invalide';
      return;
    }

    const payload = formToFicheTechniqueFrequenceRequest(this.form);
    this.loading = true;
    this.errorMsg = '';

    const obs = this.isNew
      ? this.api.create(payload)
      : this.api.update(this.ficheTechnique.id, payload);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.msgService.success('Fiche fréquences enregistrée');
        this.notifyActionOperation.emit(operations.table);
      },
      error: (e) => {
        console.error('Save fiche fréquence failed:', e);
        this.errorMsg = 'Enregistrement impossible';
        this.loading = false;
      }
    });
  }

  // ---------- Mise à jour des colonnes dynamiques ----------
  private updateDisplayedColumns(): void {
    const stationCfg = this.cfg[this.cat]?.stations;
    const canalCfg   = this.cfg[this.cat]?.canaux;

    // ---------- STATIONS ----------
    const sCols: string[] = [];

    if (!stationCfg || stationCfg.type_station?.visible !== false) {
      sCols.push('type_station');
    }
    if (!stationCfg || stationCfg.puissance?.visible !== false) {
      sCols.push('puissance');
    }
    if (!stationCfg || stationCfg.nbre_station?.visible !== false) {
      sCols.push('nbre_station');
    }
    if (!stationCfg || stationCfg.debit?.visible !== false) {
      sCols.push('debit');
    }
    if (!stationCfg || stationCfg.largeur_bande?.visible !== false) {
      sCols.push('largeur_bande');
    }
    if (!stationCfg || stationCfg.largeur_bande_unite?.visible !== false) {
      sCols.push('largeur_bande_unite');
    }
    if (!stationCfg || stationCfg.bande_frequence?.visible !== false) {
      sCols.push('bande_frequence');
    }
    if (!stationCfg || stationCfg.caractere_commercial?.visible !== false) {
      sCols.push('caractere_commercial');
    }
    if (!stationCfg || stationCfg.nbre_tranche?.visible !== false) {
      sCols.push('nbre_tranche');
    }
    if (!stationCfg || stationCfg.localite?.visible !== false) {
      sCols.push('localite');
    }

    sCols.push('actions');
    this.displayedColumnsStations = sCols;

    // ---------- CANAUX ----------
    const cCols: string[] = [];

    if (!canalCfg || canalCfg.type_station?.visible !== false) {
      cCols.push('type_station');
    }
    if (!canalCfg || canalCfg.type_canal?.visible !== false) {
      cCols.push('type_canal');
    }
    if (!canalCfg || canalCfg.zone_couverture?.visible !== false) {
      cCols.push('zone_couverture');
    }
    if (!canalCfg || canalCfg.nbre_tranche?.visible !== false) {
      cCols.push('nbre_tranche');
    }
    if (!canalCfg || canalCfg.largeur_bande?.visible !== false) {
      cCols.push('largeur_bande');
    }
    if (!canalCfg || canalCfg.largeur_bande_unite?.visible !== false) {
      cCols.push('largeur_bande_unite');
    }
    if (!canalCfg || canalCfg.bande_frequence?.visible !== false) {
      cCols.push('bande_frequence');
    }

    cCols.push('actions');
    this.displayedColumnsCanaux = cCols;
  }

  getRecapClient(): string {
    const id = this.ficheFG?.get('client')?.value;
    const found = this.clients?.find(c => c.id === id);
    return found?.denomination_sociale || '';
  }

  getRecapCategorie(): string {
    const id = this.ficheFG?.get('categorie_produit')?.value;
    const found = this.categoriesFiltered?.find(c => c.id === id);
    return found?.libelle || '';
  }

  getRecapObjet(): string {
    return this.ficheFG?.get('objet')?.value || '';
  }

  getRecapCommentaire(): string {
    return this.ficheFG?.get('commentaire')?.value || '';
  }

  // ---------- RETOUR LISTE ----------
  onRetourListe(): void {
    this.notifyFicheTechnique.emit(this.ficheTechnique);
    this.notifyActionOperation.emit(operations.table);
  }
}
