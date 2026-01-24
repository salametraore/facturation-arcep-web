// src/app/facture/frequences/frequences-crud/frequences-crud.component.ts

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatTable} from '@angular/material/table';

import {FicheTechniques, MiseAJourStatutFiche} from '../../../shared/models/ficheTechniques';

import {
  CategoryId,
  CategoryRuleSet,
  FicheTechniqueCanalRuleSet,
  FicheTechniqueStationRuleSet
} from '../../../shared/models/frequences-category.types';

import {
  CalculFraisFrequenceRequest,
  CalculFraisFrequenceResult,
  FicheTechniqueCanalRequest,
  FicheTechniqueFrequenceCreateRequest,
  FicheTechniqueFrequenceDetail,
  FicheTechniqueStationRequest
} from '../../../shared/models/fiche-technique-frequence-create-request';

import {
  buildCanalFG,
  buildFicheTechniqueFrequenceForm,
  buildStationFG,
  formToFicheTechniqueFrequenceCreateRequest,
  getCanauxFA,
  getStationsFA
} from '../forms/frequences.form';

import {CATEGORY_CONFIG} from '../config/frequences-category.config';

import {FichesTechniquesFrequenceService} from '../../../shared/services/fiches-techniques-frequences';
import {MsgMessageServiceService} from '../../../shared/services/msg-message-service.service';
import {DialogService} from '../../../shared/services/dialog.service';
import {operations, date_converte} from '../../../constantes';

import {
  StationDialogData,
  StationFrequencesDialogComponent
} from '../modals/station-frequences-dialog/station-frequences-dialog.component';

import {
  CanalDialogData,
  CanalFrequencesDialogComponent
} from '../modals/canal-frequences-dialog/canal-frequences-dialog.component';

import {CategorieProduit} from '../../../shared/models/categorie-produit';
import {StatutFicheTechnique} from '../../../shared/models/statut-fiche-technique';
import {Client} from '../../../shared/models/client';
import {HistoriqueFicheTechnique} from '../../../shared/models/historique-traitement-fiche-technique';
import {FicheTechniquesService} from '../../../shared/services/fiche-techniques.service';
import {CategorieProduitService} from '../../../shared/services/categorie-produit.service';
import {ProduitService} from '../../../shared/services/produits.service';
import {ClientService} from '../../../shared/services/client.service';
import {StatutFicheTechniqueService} from '../../../shared/services/statut-fiche-technique.service';
import {TypeBandeFrequence} from '../../../shared/models/typeBandeFrequenceDetail';
import {TypeCanal} from '../../../shared/models/typeCanal';
import {TypeStation} from '../../../shared/models/type-station';
import {TypeBandesFrequenceService} from '../../../shared/services/type-bandes-frequence.service';
import {TypeStationService} from '../../../shared/services/type-station.service';
import {TypeCanauxService} from '../../../shared/services/type-canaux.service';
import {ZoneCouverture} from '../../../shared/models/zone-couverture';
import {ZoneCouvertureService} from '../../../shared/services/zone-couverture.service';
import {Utilisateur} from '../../../shared/models/utilisateur';
import {AuthService} from '../../../authentication/auth.service';
import {FicheTechniqueCanal, FicheTechniqueStation} from '../../../shared/models/fiche-technique-frequence';
import {startWith, map, finalize, mapTo, switchMap, tap} from 'rxjs/operators';
import {CaractereRadioService} from "../../../shared/services/caractere-radio.service";
import {CaractereRadio} from "../../../shared/models/caractere-radio.model";

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

  displayedColumnsStations: string[] = [
    'no',
    'type_station',
    'puissance',
    'nombre_station',
    'debit_kbps',
    'largeur_bande_mhz',
    'type_bande_frequence',
    'caractere_radio',
    'nbre_tranche',
    'localite',
    'actions'
  ];

  displayedColumnsCanaux: string[] = [
    'no',
    'type_station',
    'type_canal',

    // ✅ nbre_canaux (cat=4 uniquement via config)
    'nbre_canaux',

    'zone_couverture',
    'nbre_tranche_facturation',
    'largeur_bande_khz',
    'type_bande_frequence',
    'mode_duplexage',
    'puissance_sortie',
    'actions'
  ];

  @ViewChild('stationsTable') stationsTable: MatTable<any>;
  @ViewChild('canauxTable') canauxTable: MatTable<any>;

  form: FormGroup;

  cat: CategoryId;
  cfg = CATEGORY_CONFIG;
  cfgRecap: Record<CategoryId, CategoryRuleSet> = CATEGORY_CONFIG;

  loading = false;
  errorMsg = '';

  clients: Client[];
  client: Client;

  clientSearchCtrl = new FormControl<any>(''); // string ou Client
  filteredClients: Client[] = [];

  categories: CategorieProduit[];
  categoriesFiltered: CategorieProduit[];
  categorie: CategorieProduit;
  statutFicheTechniques: StatutFicheTechnique[];
  statutFicheTechnique: StatutFicheTechnique;
  historiqueFicheTechniques: HistoriqueFicheTechnique[];

  typeBandeFrequences: TypeBandeFrequence[];
  typeBandeFrequence: TypeBandeFrequence;
  typeCanaux: TypeCanal[];
  tyepCanal: TypeCanal;
  typeStations: TypeStation[];

  caractereRadios: CaractereRadio[];

  zoneCouvertures: ZoneCouverture[];
  zoneCouverture: ZoneCouverture;

  isNew = true;
  showStationsStep = false;
  showCanauxStep = false;
  showTarifsStep = false;

  isLinear = true;

  utilisateurConnecte: Utilisateur;

  resultatCalcul?: CalculFraisFrequenceResult;
  loadingCalcul = false;
  errorCalcul = '';

  transmitLocked = false;

  private stationIdToNo = new Map<number, number>();
  private canalIdToNo = new Map<number, number>();

  protected readonly operations = operations;

  constructor(
    private fb: FormBuilder,
    private fichesTechniquesFrequenceService: FichesTechniquesFrequenceService,
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
    private caractereRadioService: CaractereRadioService,
    private zoneCouvertureService: ZoneCouvertureService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private msgMessageService: MsgMessageServiceService,
    private authService: AuthService,
  ) {}

  // Getters pratiques (safe)
  get ficheFG(): FormGroup {
    return this.form?.get('fiche') as FormGroup;
  }

  get stationsFA(): FormArray {
    return this.form ? getStationsFA(this.form) : this.fb.array([]);
  }

  get canauxFA(): FormArray {
    return this.form ? getCanauxFA(this.form) : this.fb.array([]);
  }

  displayClient = (c: Client | null): string => {
    return c?.denomination_sociale ?? '';
  };

  private filterClients(value: any): Client[] {
    const q = (typeof value === 'string' ? value : value?.denomination_sociale ?? '')
      .toLowerCase()
      .trim();

    if (!q) return this.clients ?? [];

    return (this.clients ?? []).filter(c =>
      (c?.denomination_sociale ?? '').toLowerCase().includes(q)
    );
  }

  onClientSelected(c: Client): void {
    if (!c) return;

    // 1) on stocke l'ID dans le formGroup métier
    this.ficheFG?.get('client')?.setValue(c.id);

    // 2) on garde l'objet pour tes usages
    this.onGetClient(c);
  }

  clearClientSelection(): void {
    this.clientSearchCtrl.setValue('');
    this.ficheFG?.get('client')?.setValue(null);
    this.client = undefined as any;
  }

  ngOnInit(): void {
    this.utilisateurConnecte = this.authService.getConnectedUser();

    // Cas création
    if (this.operation === operations.create) {
      this.isNew = true;
      this.initCreate();
      this.loadData();
      return;
    }

    // Cas édition / transmettre : fiche sélectionnée obligatoire
    if (!this.ficheTechnique) {
      this.errorMsg = 'Aucune fiche sélectionnée';
      return;
    }

    this.isNew = false;
    this.loadData();
    this.initUpdate();

    console.log('operation : ' + this.operation);
  }

  // ---------- Chargement des référentiels ----------
  loadData(): void {

    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;

      this.categoriesFiltered = categories
        .filter(c => c.id < 8)
        .sort((a, b) =>
          (a.libelle ?? '').localeCompare(b.libelle ?? '', 'fr', {sensitivity: 'base'})
        );
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
      this.statutFicheTechnique = statutFicheTechniques.find(st => st.id === 1);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients ?? [];

      this.filteredClients = this.clients;

      this.clientSearchCtrl.valueChanges
        .pipe(
          startWith(''),
          map(v => this.filterClients(v))
        )
        .subscribe(list => (this.filteredClients = list));

      // ✅ si en update et client déjà connu, pré-remplir le champ texte
      const clientId = this.ficheFG?.get('client')?.value;
      if (clientId) {
        const found = this.clients.find(x => x.id === clientId);
        if (found) {
          this.clientSearchCtrl.setValue(found, { emitEvent: false });
          this.onGetClient(found);
        }
      }
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

    this.typeCanauxService.getListItems().subscribe((listeCanaux: TypeCanal[]) => {
      this.typeCanaux = listeCanaux;
    });

    this.typeStationService.getListItems().subscribe((listeTypeStations: TypeStation[]) => {
      this.typeStations = listeTypeStations;
    });

    this.caractereRadioService.getListItems().subscribe((listeCaractereRadios: CaractereRadio[]) => {
      this.caractereRadios = listeCaractereRadios;
    });

    this.typeBandesFrequenceService.getListItems().subscribe((listeTypeBandesFreq: TypeBandeFrequence[]) => {
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

    this.transmitLocked = false;

    const ficheFreq: Partial<FicheTechniqueFrequenceCreateRequest> = {
      client: null,
      categorie_produit: null,
      objet: null,
      commentaire: null,

      direction: 3,
      utilisateur: null,
      date_creation: new Date().toISOString().substring(0, 10),
      avis: 'NOF',
      duree: 3,
      position: 1,
      periode: null,
      position_direction: null,
      date_avis: null,
      date_fin: null,
      date_debut: null,
      stations: [],
      canaux: []
    };

    this.form = buildFicheTechniqueFrequenceForm(this.fb, ficheFreq);

    this.showStationsStep = false;
    this.showCanauxStep = false;
    this.showTarifsStep = false;

    this.updateDisplayedColumns();

    this.ficheFG.get('categorie_produit')?.valueChanges.subscribe(val => {
      if (val != null) {
        this.cat = val as CategoryId;
        this.updateDisplayedColumns();
        this.rebuildLinesForCategory(this.cat);
      }
    });
  }

  // ---------- Initialisation édition ----------
  private initUpdate(): void {
    this.loading = true;
    this.errorMsg = '';

    this.transmitLocked = false;

    this.fichesTechniquesFrequenceService.getDetailFicheTechniqueFrequence(this.ficheTechnique.id).subscribe({
      next: (fiche: FicheTechniqueFrequenceDetail) => {
        console.log('fiche initUpdate');
        console.log(fiche);

        this.cat = (fiche.categorie_produit as CategoryId);
        this.form = buildFicheTechniqueFrequenceForm(this.fb, fiche);

        (fiche.stations || []).forEach((s: FicheTechniqueStation) => {
          this.stationsFA.push(buildStationFG(this.fb, s, this.cat));
        });

        (fiche.canaux || []).forEach((c: FicheTechniqueCanal) => {
          this.canauxFA.push(buildCanalFG(this.fb, c, this.cat));
        });

        this.loading = false;

        this.updateDisplayedColumns();

        this.showStationsStep = true;
        this.showCanauxStep = true;
        this.showTarifsStep = true;

        this.ficheFG.get('categorie_produit')?.valueChanges.subscribe(val => {
          if (val != null) {
            this.cat = val as CategoryId;
            this.updateDisplayedColumns();
            this.rebuildLinesForCategory(this.cat);
          }
        });

        this.buildNoMapsFromFiche(fiche);
        this.loadTarifsIfPossible(this.ficheTechnique.id);
      },
      error: (e) => {
        console.error('GET fiche fréquence failed:', e);
        this.errorMsg = `${e.status} ${e.statusText} — ${e?.error?.detail || e?.message || 'Chargement impossible'}`;
        this.loading = false;
      }
    });
  }

  // ---------- CALCUL TARIFS (STEP 4) ----------
  private loadTarifsIfPossible(ficheId?: number | null): void {
    if (!ficheId) return;

    this.loadingCalcul = true;
    this.errorCalcul = '';
    this.resultatCalcul = undefined;

    const payloadCalcul: CalculFraisFrequenceRequest = {
      fiche_id: ficheId,
      enregistrer: false
    };

    this.fichesTechniquesFrequenceService
      .calculerFraisFicheTechniqueFrequence(payloadCalcul)
      .pipe(finalize(() => (this.loadingCalcul = false)))
      .subscribe({
        next: (result: CalculFraisFrequenceResult) => {
          this.resultatCalcul = result;
          console.log('resultatCalcul');
          console.log(this.resultatCalcul);
        },
        error: () => {
          this.errorCalcul = 'Erreur lors du calcul des frais';
        }
      });
  }

  // ---------- STATIONS : TABLE + MODALE ----------
  onOpenStationDialog(index?: number): void {
    let stationValue: FicheTechniqueStationRequest | undefined;

    if (index != null) {
      const fg = this.stationsFA.at(index) as FormGroup;
      stationValue = fg.getRawValue() as FicheTechniqueStationRequest;
    }

    const dialogRef = this.dialog.open<StationFrequencesDialogComponent, StationDialogData,
      FicheTechniqueStationRequest>(StationFrequencesDialogComponent, {
      width: '800px',
      data: {station: stationValue, cat: this.cat}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (index != null) {
        (this.stationsFA.at(index) as FormGroup).patchValue(result);
      } else {
        this.stationsFA.push(buildStationFG(this.fb, result, this.cat));
      }

      this.stationsTable?.renderRows();
    });
  }

  onRemoveStation(index: number): void {
    this.dialogService.yes_no({message: 'Supprimer cette station ?'})
      .subscribe(yes => {
        if (yes) {
          this.stationsFA.removeAt(index);
          this.stationsTable?.renderRows();
        }
      });
  }

  onRemoveCanal(index: number): void {
    this.dialogService.yes_no({message: 'Supprimer ce canal ?'})
      .subscribe(yes => {
        if (yes) {
          this.canauxFA.removeAt(index);
          this.canauxTable?.renderRows();
        }
      });
  }

  // ---------- CANAUX : TABLE + MODALE ----------
  canAddCanal(): boolean {
    return this.hasCanauxToFill();
  }

  onOpenCanalDialog(index?: number): void {
    let canalValue: FicheTechniqueCanalRequest | undefined;

    if (index != null) {
      const fg = this.canauxFA.at(index) as FormGroup;
      canalValue = fg.getRawValue() as FicheTechniqueCanalRequest;
    }

    const dialogRef = this.dialog.open<CanalFrequencesDialogComponent,
      CanalDialogData,
      FicheTechniqueCanalRequest>(CanalFrequencesDialogComponent, {
      width: '800px',
      data: {canal: canalValue, cat: this.cat}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      // ✅ cat=4 : sécuriser le calcul en sortie (au cas où la modale ne le fait pas)
      if (this.cat === 4) {
        const largeur = Number(String(result.largeur_bande_khz ?? 0).replace(',', '.')) || 0;
        const nbreCanaux = Math.max(1, Math.floor(Number(result.nbre_canaux ?? 1)));

        const raw = (largeur * nbreCanaux) / 25;
        result.nbre_tranche_facturation = Math.max(1, Math.ceil(raw));
      }

      if (index != null) {
        (this.canauxFA.at(index) as FormGroup).patchValue(result);
      } else {
        this.canauxFA.push(buildCanalFG(this.fb, result, this.cat));
      }

      this.canauxTable?.renderRows();
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
    if (!this.hasCanauxToFill()) return true;
    if (!this.canauxFA) return false;
    return this.canauxFA.valid;
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

    if (this.isNew) {
      this.stationsFA.clear();
      this.canauxFA.clear();
    }

    this.showStationsStep = true;
    this.showCanauxStep = true;
    this.showTarifsStep = true;

    this.isLinear = false;
  }

  // ---------- SAUVEGARDE ----------
  private logInvalidControls(fg: FormGroup, prefix = ''): void {
    Object.keys(fg.controls).forEach(key => {
      const c: any = fg.get(key);
      const path = prefix ? `${prefix}.${key}` : key;

      if (!c) return;

      if (c.controls) {
        this.logInvalidControls(c, path);
      } else if (c.invalid) {
        console.log('INVALID:', path, 'value=', c.value, 'errors=', c.errors);
      }
    });
  }

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  private rebuildLinesForCategory(cat: CategoryId): void {
    for (let i = 0; i < this.stationsFA.length; i++) {
      const old = this.stationsFA.at(i) as FormGroup;
      const value = old.getRawValue();
      this.stationsFA.setControl(i, buildStationFG(this.fb, value, cat));
    }

    for (let i = 0; i < this.canauxFA.length; i++) {
      const old = this.canauxFA.at(i) as FormGroup;
      const value = old.getRawValue();
      this.canauxFA.setControl(i, buildCanalFG(this.fb, value, cat));
    }

    this.stationsTable?.renderRows();
    this.canauxTable?.renderRows();
  }

  onSave(): void {
    console.log('debut save ');
    console.log(' this.form.invalid :  ' + this.form?.invalid);

    if (!this.form || this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('FORM INVALID');
      this.logInvalidControls(this.form);
      return;
    }

    // ✅ auto-objet (champ non affiché)
    const catId = this.ficheFG.get('categorie_produit')?.value as number | null;
    if (catId) {
      const objet = this.getCategorieProduit(catId) ?? '';
      this.ficheFG.get('objet')?.setValue(objet);
    }

    let payload = formToFicheTechniqueFrequenceCreateRequest(this.form);

    payload = {
      ...payload,
      date_debut: payload.date_debut ? date_converte(payload.date_debut as any) : payload.date_debut,
    };

    // ✅ renseigner designation (stations + canaux) avant envoi
    payload = {
      ...payload,
      stations: (payload.stations ?? []).map(s => ({
        ...s,
        designation: this.formatStationLine(s),
      })),
      canaux: (payload.canaux ?? []).map(c => ({
        ...c,
        designation: this.formatCanalLine(c),
      })),
    };

    this.loading = true;
    this.errorMsg = '';

    // ✅ règle existante : si cat=6 et nombre_station vide => 1
    if (this.cat === 6) {
      payload = {
        ...payload,
        stations: (payload.stations ?? []).map(s => ({
          ...s,
          nombre_station: (s.nombre_station == null) ? 1 : s.nombre_station
        }))
      };
    }

    console.log('this.isNew : ' + this.isNew);
    console.log('payload');
    console.log(payload);

    const obs = this.isNew
      ? this.fichesTechniquesFrequenceService.initierFicheTechniqueFrequence(payload)
      : this.fichesTechniquesFrequenceService.updateFicheTechniqueFrequence(this.ficheTechnique.id, payload);

    obs.subscribe({
      next: (saved: any) => {
        this.loading = false;
        this.msgService.success('Fiche fréquences enregistrée');

        if (this.isNew) {
          const newId = saved?.id;
          if (newId) {
            this.isNew = false;
            this.ficheTechnique = {...(this.ficheTechnique ?? {}), id: newId} as any;
            this.loadTarifsIfPossible(newId);
          }
        } else {
          this.loadTarifsIfPossible(this.ficheTechnique.id);
        }

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
    const canalCfg = this.cfg[this.cat]?.canaux;

    // ---------- STATIONS ----------
    const sCols: string[] = [];
    sCols.push('no');

    if (!stationCfg || stationCfg.type_station?.visible !== false) sCols.push('type_station');
    if (!stationCfg || stationCfg.puissance?.visible !== false) sCols.push('puissance');
    if (!stationCfg || stationCfg.nombre_station?.visible !== false) sCols.push('nombre_station');
    if (!stationCfg || stationCfg.debit_kbps?.visible !== false) sCols.push('debit_kbps');
    if (!stationCfg || stationCfg.largeur_bande_mhz?.visible !== false) sCols.push('largeur_bande_mhz');
    if (!stationCfg || stationCfg.type_bande_frequence?.visible !== false) sCols.push('type_bande_frequence');
    if (!stationCfg || stationCfg.caractere_radio?.visible !== false) sCols.push('caractere_radio');
    if (!stationCfg || stationCfg.nbre_tranche?.visible !== false) sCols.push('nbre_tranche');
    if (!stationCfg || stationCfg.localite?.visible !== false) sCols.push('localite');

    sCols.push('actions');
    this.displayedColumnsStations = sCols;

    // ---------- CANAUX ----------
    const cCols: string[] = [];
    cCols.push('no');

    if (!canalCfg || canalCfg.type_station?.visible !== false) cCols.push('type_station');
    if (!canalCfg || canalCfg.type_canal?.visible !== false) cCols.push('type_canal');

    // ✅ nbre_canaux visible uniquement en cat=4 via config
    if (!canalCfg || canalCfg.nbre_canaux?.visible !== false) cCols.push('nbre_canaux');

    if (!canalCfg || canalCfg.zone_couverture?.visible !== false) cCols.push('zone_couverture');
    if (!canalCfg || canalCfg.nbre_tranche_facturation?.visible !== false) cCols.push('nbre_tranche_facturation');
    if (!canalCfg || canalCfg.largeur_bande_khz?.visible !== false) cCols.push('largeur_bande_khz');
    if (!canalCfg || canalCfg.type_bande_frequence?.visible !== false) cCols.push('type_bande_frequence');
    if (!canalCfg || canalCfg.mode_duplexage?.visible !== false) cCols.push('mode_duplexage');
    if (!canalCfg || canalCfg.puissance_sortie?.visible !== false) cCols.push('puissance_sortie');

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

  // ---------- RETOUR LISTE ----------
  onRetourListe(): void {
    this.notifyFicheTechnique.emit(this.ficheTechnique);
    this.notifyActionOperation.emit(operations.table);
  }

  hasCanauxToFill(): boolean {
    const canalCfg = this.cfg?.[this.cat]?.canaux;
    if (!canalCfg) return false;

    const keys: (keyof typeof canalCfg)[] = [
      'type_station',
      'type_canal',

      // ✅ nbre_canaux (visible seulement cat=4)
      'nbre_canaux',

      'zone_couverture',
      'nbre_tranche_facturation',
      'largeur_bande_khz',
      'type_bande_frequence',
      'mode_duplexage',
      'puissance_sortie',
    ];

    return keys.some(k => canalCfg[k]?.visible === true);
  }

  onTransmettre(): void {
    const ficheId = this.ficheTechnique?.id;
    if (!ficheId) {
      this.dialogService.alert({ message: 'Aucune fiche sélectionnée.' });
      return;
    }

    if (this.loadingCalcul || this.transmitLocked) return;

    this.loadingCalcul = true;

    const payloadCalcul: CalculFraisFrequenceRequest = {
      fiche_id: ficheId,
      enregistrer: true
    };

    const miseAJourStatutFiche: MiseAJourStatutFiche = new MiseAJourStatutFiche();
    miseAJourStatutFiche.fiche_technique = ficheId;
    miseAJourStatutFiche.statut = 2;

    this.fichesTechniquesFrequenceService.calculerFraisFicheTechniqueFrequence(payloadCalcul).pipe(
      mapTo(void 0),
      switchMap(() => this.ficheTechniquesService.setStatutFiche(miseAJourStatutFiche)),
      tap(() => {
        this.transmitLocked = true;
        this.msgMessageService.success('Fiche transmise avec succès !');
      }),
      finalize(() => {
        this.loadingCalcul = false;
      })
    ).subscribe({
      next: () => {},
      error: (e) => {
        console.error('Erreur (calcul ou transmission):', e);
        this.transmitLocked = false;

        this.dialogService.alert({
          message: e?.message ?? "Le calcul a échoué : la fiche n'a pas été transmise."
        });
      }
    });
  }

  private isVisibleStation(field: keyof FicheTechniqueStationRuleSet): boolean {
    const rule = this.cfgRecap?.[this.cat]?.stations?.[field];
    return rule?.visible !== false;
  }

  private isVisibleCanal(field: keyof FicheTechniqueCanalRuleSet): boolean {
    const rule = this.cfgRecap?.[this.cat]?.canaux?.[field];
    return rule?.visible !== false;
  }

  private hasValue(v: any): boolean {
    return v !== null && v !== undefined && v !== '';
  }

  private fmtNumber(v: any, fractionDigits = 0): string {
    if (!this.hasValue(v)) return '';
    const n = Number(String(v).replace(',', '.'));
    if (Number.isNaN(n)) return String(v);

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(n);
  }

  formatStationLine(s: any): string {
    const title = this.isVisibleStation('type_station')
      ? (this.getLibelleTypeStation(s?.type_station) || 'Type station ?')
      : 'Station';

    const details: string[] = [];

    if (this.isVisibleStation('nombre_station') && this.hasValue(s?.nombre_station)) {
      details.push(`${this.fmtNumber(s.nombre_station)} station(s)`);
    }

    if (this.isVisibleStation('puissance') && this.hasValue(s?.puissance)) {
      details.push(`Puissance : ${this.fmtNumber(s.puissance)} W`);
    }

    if (this.isVisibleStation('debit_kbps') && this.hasValue(s?.debit_kbps)) {
      details.push(`Débit : ${this.fmtNumber(s.debit_kbps)} kb/s`);
    }

    // ✅ DECIMAL largeur bande (recap)
    if (this.isVisibleStation('largeur_bande_mhz') && this.hasValue(s?.largeur_bande_mhz)) {
      details.push(`Largeur bande : ${this.fmtNumber(s.largeur_bande_mhz, 2)} MHz`);
    }

    if (this.isVisibleStation('nbre_tranche') && this.hasValue(s?.nbre_tranche)) {
      details.push(`Nbre de Tranches : ${this.fmtNumber(s.nbre_tranche)}`);
    }

    if (this.isVisibleStation('type_bande_frequence') && this.hasValue(s?.type_bande_frequence)) {
      const b = this.getLibelleTypeBandeFrequence(s.type_bande_frequence);
      if (b) details.push(`Type bande : ${b}`);
    }

    if (this.isVisibleStation('caractere_radio') && this.hasValue(s?.caractere_radio)) {
      details.push(`Caractère : ${this.getLibelleCaractereRadio(s.caractere_radio)}`);
    }

    if (this.isVisibleStation('localite') && this.hasValue(s?.localite)) {
      details.push(`Localité : ${s.localite}`);
    }

    return details.length ? `${title} — ${details.join(' · ')}` : title;
  }

  formatCanalLine(c: any): string {
    const title = this.isVisibleCanal('type_canal')
      ? (this.getLibelleTypeCanal(c?.type_canal) || 'Type canal ?')
      : 'Canal';

    const details: string[] = [];

    if (this.isVisibleCanal('type_station') && this.hasValue(c?.type_station)) {
      const ts = this.getLibelleTypeStation(c.type_station);
      if (ts) details.push(`Station : ${ts}`);
    }

    // ✅ nbre_canaux visible seulement cat=4
    if (this.isVisibleCanal('nbre_canaux') && this.hasValue(c?.nbre_canaux)) {
      details.push(`Nb canaux : ${this.fmtNumber(c.nbre_canaux)}`);
    }

    if (this.isVisibleCanal('zone_couverture') && this.hasValue(c?.zone_couverture)) {
      const z = this.getLibelleZoneCouverture(c.zone_couverture);
      if (z) details.push(`Zone : ${z}`);
    }

    // ✅ DECIMAL largeur bande (recap)
    if (this.isVisibleCanal('largeur_bande_khz') && this.hasValue(c?.largeur_bande_khz)) {
      details.push(`Largeur bande : ${this.fmtNumber(c.largeur_bande_khz, 2)} kHz`);
    }

    if (this.isVisibleCanal('type_bande_frequence') && this.hasValue(c?.type_bande_frequence)) {
      const b = this.getLibelleTypeBandeFrequence(c.type_bande_frequence);
      if (b) details.push(`Type bande : ${b}`);
    }

    if (this.isVisibleCanal('mode_duplexage') && this.hasValue(c?.mode_duplexage)) {
      details.push(`Duplex : ${String(c.mode_duplexage)}`);
    }

    if (this.isVisibleCanal('puissance_sortie') && this.hasValue(c?.puissance_sortie)) {
      details.push(`P.sortie : ${this.fmtNumber(c.puissance_sortie)} W`);
    }

    if (this.isVisibleCanal('nbre_tranche_facturation') && this.hasValue(c?.nbre_tranche_facturation)) {
      details.push(`Tranches : ${this.fmtNumber(c.nbre_tranche_facturation)}`);
    }

    return details.length ? `${title} — ${details.join(' · ')}` : title;
  }

  /** Reconstruit les correspondances ID -> N° (index+1) selon l’ordre du FormArray */
  private buildNoMapsFromFiche(fiche: FicheTechniqueFrequenceDetail): void {
    this.stationIdToNo.clear();
    this.canalIdToNo.clear();

    (fiche.stations ?? []).forEach((s, idx) => {
      const id = Number((s as any)?.id);
      if (!Number.isNaN(id) && id > 0) this.stationIdToNo.set(id, idx + 1);
    });

    (fiche.canaux ?? []).forEach((c, idx) => {
      const id = Number((c as any)?.id);
      if (!Number.isNaN(id) && id > 0) this.canalIdToNo.set(id, idx + 1);
    });
  }

  stationNoFromId(id?: number | null): string {
    if (id == null) return '-';
    return String(this.stationIdToNo.get(id) ?? '?');
  }

  canalNoFromId(id?: number | null): string {
    if (id == null) return '-';
    return String(this.canalIdToNo.get(id) ?? '?');
  }

  stationNo(d: any): string {
    return d?.station_id ? this.stationNoFromId(d.station_id) : '-';
  }

  canalNo(d: any): string {
    return d?.canal_id ? this.canalNoFromId(d.canal_id) : '-';
  }

  getLibelleCaractereRadio(id?: number | null): string {
    if (!id || !this.caractereRadios || this.caractereRadios.length === 0) {
      return '';
    }
    const found = this.caractereRadios.find(cr => cr.id === id);
    return found?.libelle ?? '';
  }

}
