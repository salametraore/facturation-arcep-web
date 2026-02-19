import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Observable,Subject, of } from 'rxjs';
import { finalize, take,catchError, distinctUntilChanged, switchMap, tap, takeUntil,map, startWith  } from 'rxjs/operators';

import { SelectionModel } from '@angular/cdk/collections';
import { MatStepper } from '@angular/material/stepper';

import { CategorieProduit } from '../../shared/models/categorie-produit';
import { Client } from '../../shared/models/client';
import { GenererRedevanceRequest } from '../../shared/models/redevances-a-generer';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';
import { ClientService } from '../../shared/services/client.service';
import { FactureService } from '../../shared/services/facture.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';
import { DialogService } from '../../shared/services/dialog.service';
import { RedevanceAGenerer } from '../../shared/models/redevances-a-generer';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {Parametre} from "../../shared/models/parametres";
import {ParametreService} from "../../shared/services/parametres.services";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";

type GenRedevanceControls = {
  categorie: FormControl<number | null>;
  annee: FormControl<number>;
  client: FormControl<number | null>;
  signataire: FormControl<string | null>;
};

@Component({
  selector: 'generation-redevance',
  templateUrl: './generation-redevance.component.html'
})
export class GenerationRedevanceComponent implements OnInit {

  categories: CategorieProduit[] = [];
  clients: Client[] = [];
  ficheTechniques?: FicheTechniques[]= [];
  parametres : Parametre[] = [];
  signataireParam: Parametre | null = null;

  allCategories: CategorieProduit[] = [];
  isCategoriesLoading = false;

  clientCtrl = new FormControl<Client | null>(null);
  filteredClients$!: Observable<Client[]>;

  private readonly ALLOWED_CATEGORY_CODES = new Set<string>([
    'mobile','aero','public','fixe','radio','sat','amateur','numerotation','domaine','confiance'
  ]);



  private destroy$ = new Subject<void>();

  // Step 2 : données de l’API
  listeRedevancesCandidates: RedevanceAGenerer[] = [];

// propriété de sélection déjà existante
  selection = new SelectionModel<RedevanceAGenerer>(true, []);

  form = new FormGroup<GenRedevanceControls>({
    categorie: new FormControl<number | null>(null, { validators: [Validators.required] }),
    annee: new FormControl<number>(new Date().getFullYear(), {
      validators: [Validators.required, Validators.min(2000), Validators.max(2100)]
    }),
    client: new FormControl<number | null>(null),
    signataire: new FormControl<string | null>(null, { validators: [Validators.required] }),
  });

  isLoading = false;
  generated = false;
  isListing = false; // spinner pour la liste

  displayedColumns: string[] = [
    'select',
    'client',
    'objet',
    'type_frais',
    'montant_total',
    'periode_debut',
    'periode_fin'
  ];

  // colonnes du step 2 (SANS objet)
  displayedColumnsStep2: string[] = [
    'select',
    'client',
    'montant_total',
    'periode_debut',
    'periode_fin',
    'type_frais',
    'actions'
  ];

// colonnes du step 3 (recap) – pas de sélection
  displayedColumnsStep3: string[] = [
    'client',
    'montant_total',
    'periode_debut',
    'periode_fin',
    'type_frais',
    'actions'
  ];
  // pour ligne de détail expandable
  expandedRedevance: RedevanceAGenerer | null = null;

  detailRedevance: RedevanceAGenerer | null = null;


  constructor(
    private factureService: FactureService,
    private clientService: ClientService,
    private categorieProduitService: CategorieProduitService,
    private parametreService:ParametreService,
    private ficheTechniquesService: FicheTechniquesService,
    private snack: MatSnackBar,
    private msgMessageService: MsgMessageServiceService,
    public dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // 1) Charger la base des catégories autorisées (liste blanche sur code)
    this.categorieProduitService.getListItems()
      .pipe(take(1))
      .subscribe((cats) => {
        const base = (cats ?? []).filter(c =>
          this.ALLOWED_CATEGORY_CODES.has(this.normCode(c.code))
        );

        this.allCategories = base;
        this.categories = base; // client non choisi => base filtrée

        // si client déjà sélectionné, on filtrera après le chargement des fiches
        this.applyCategoriesForClient(this.form.controls.client.value);
      });

    // 2) Charger les clients
// 2) Charger les clients
    this.clientService.getItems()
      .pipe(take(1))
      .subscribe((cls) => {
        this.clients = cls ?? [];

        // Observable des suggestions (filtre par denomination_sociale)
        this.filteredClients$ = this.clientCtrl.valueChanges.pipe(
          startWith(this.clientCtrl.value),
          map((value) => {
            const search = typeof value === 'string'
              ? value
              : (value?.denomination_sociale ?? '');

            const s = (search ?? '').trim().toLowerCase();
            if (!s) return this.clients;

            return this.clients.filter(c =>
              (c.denomination_sociale ?? '').toLowerCase().includes(s)
            );
          })
        );

        // synchro clientCtrl -> form.client (id)
        this.syncClientCtrlToId();

        // si form.client avait déjà une valeur (id), on pré-remplit l'autocomplete
        const id = this.form.controls.client.value;
        if (id) {
          const found = this.clients.find(c => c.id === id) ?? null;
          this.clientCtrl.setValue(found, { emitEvent: false });
        }
      });

    // 3) Charger paramètre SIGNATAIRE + init champ
    this.parametreService.getItems()
      .pipe(take(1))
      .subscribe((params: Parametre[]) => {
        this.parametres = params ?? [];

        this.signataireParam =
          this.parametres.find(p => (p.key ?? '').trim().toUpperCase() === 'SIGNATAIRE') ?? null;

        const signataireValue = (this.signataireParam?.value ?? '').trim();
        if (signataireValue) {
          this.form.controls.signataire.setValue(signataireValue, { emitEvent: false });
          // optionnel : rendre le champ non modifiable
          // this.form.controls.signataire.disable({ emitEvent: false });
        }
      });

    // 4) Changement client => charger fiches techniques => filtrer catégories
    this.form.controls.client.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => {
          // reset catégorie pour éviter une sélection devenue invalide
          this.form.controls.categorie.reset(null, { emitEvent: false });
          this.isCategoriesLoading = true;
        }),
        switchMap((clientId) => {

          // Si pas de client sélectionné => on revient à la base autorisée
          if (!clientId) {
            this.ficheTechniques = [];
            this.categories = this.allCategories;
            this.isCategoriesLoading = false;
            return of(null); // on stoppe le flux "API"
          }

          return this.ficheTechniquesService
            .getListeFichesTechniquesByClientId(clientId)
            .pipe(
              catchError((err) => {
                console.error('Erreur récupération fiches techniques:', err);
                this.snack.open('Erreur lors du chargement des fiches techniques du client.', 'Fermer', { duration: 4000 });
                return of([] as FicheTechniques[]);
              }),
              finalize(() => this.isCategoriesLoading = false)
            );
        })
      )
      .subscribe((fts) => {
        // cas of(null) => déjà géré dans switchMap
        if (fts === null) return;

        this.ficheTechniques = fts ?? [];
        this.applyCategoriesFromFiches(this.form.controls.client.value, this.ficheTechniques);
      });
  }

  displayClient = (c: Client | null): string => c?.denomination_sociale ?? '';

  private syncClientCtrlToId(): void {
    // quand l’utilisateur sélectionne un client (objet) => on pousse son id dans form.client
    this.clientCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((c) => {
        const id = c?.id ?? null;
        this.form.controls.client.setValue(id, { emitEvent: true }); // important: emitEvent true => déclenche filtrage catégories
      });
  }

  private applyCategoriesForClient(clientId: number | null): void {
    if (!clientId) {
      this.categories = this.allCategories;
      return;
    }
    // rien à faire ici : le vrai filtrage arrive après l'appel API des fiches
  }

  private applyCategoriesFromFiches(clientId: number | null, fts: FicheTechniques[]): void {
    if (!clientId) {
      this.categories = this.allCategories;
      return;
    }

    const catIds = new Set<number>(
      (fts ?? [])
        .map(ft => ft.categorie_produit)
        .filter((id): id is number => typeof id === 'number')
    );

    this.categories = (this.allCategories ?? []).filter(c =>
      typeof c.id === 'number' && catIds.has(c.id)
    );

    // Auto-select si une seule catégorie
    if (this.categories.length === 1 && typeof this.categories[0].id === 'number') {
      this.form.controls.categorie.setValue(this.categories[0].id, { emitEvent: false });
    }
  }

  private normCode(code?: string | null): string {
    return (code ?? '').trim().toLowerCase();
  }

  getCategorieLabel(id: number | null): string {
    if (id == null) return '';
    return this.categories.find(c => c.id === id)?.libelle ?? '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.form.controls; }

  canGenerate(): boolean {
    return this.form.valid && !this.isLoading && !this.generated;

  }

  /** Step 1 -> Step 2 : appel API + passage à la liste */
  listeRedevancesAgenerer(stepper: MatStepper): void {
    if (!this.canGenerate()) {
      return;
    }

    const payload: GenererRedevanceRequest = {
      annee: this.f.annee.value ?? undefined,
      categorie_produit: this.f.categorie.value ?? undefined,
      client: this.f.client.value ?? undefined,
      signataire: this.f.signataire.value ?? undefined,
    };

    this.isListing = true;
    this.factureService
      .listeRedevancesAnnuellesAgenerer(payload)
      .pipe(finalize(() => this.isListing = false))
      .subscribe({
        next: (res) => {
          this.listeRedevancesCandidates = res.resultat || [];
          this.selection.clear();

          console.log('Redevances candidates : ', this.listeRedevancesCandidates);

          if (this.listeRedevancesCandidates.length > 0) {
            stepper.next();
          } else {
            this.snack.open('Aucune redevance candidate trouvée.', 'Fermer', { duration: 4000 });
          }
        },
        error: (err) => {
          console.error('Erreur API (liste à générer) :', err);
          this.snack.open('Erreur lors de la récupération des redevances.', 'Fermer', { duration: 4000 });
        }
      });
  }



  /** Helpers pour la sélection dans le tableau */

  // getter pour utiliser selectedRedevances partout (HTML + TS)
  get selectedRedevances(): RedevanceAGenerer[] {
    return this.selection.selected;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.listeRedevancesCandidates.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAll(checked: boolean): void {
    this.selection.clear();
    if (checked) {
      this.listeRedevancesCandidates.forEach(row => this.selection.select(row));
    }
  }

  toggleExpand(row: RedevanceAGenerer): void {
    this.expandedRedevance = this.expandedRedevance === row ? null : row;
  }

  hasSelection(): boolean {
    return this.selection.selected.length > 0;
  }


  showDetail(row: RedevanceAGenerer): void {
    this.detailRedevance = row;
  }

  // appelé au passage Step 2 -> Step 3
  goToRecap(stepper: MatStepper): void {
    if (!this.hasSelection()) {
      this.snack.open('Veuillez sélectionner au moins une redevance.', 'Fermer', { duration: 3000 });
      return;
    }

    // selectedRedevances est maintenant un getter sur selection.selected
    this.expandedRedevance = null;
    stepper.next();
  }


  /** Lookup libellé client à partir du client_id de la redevance */
  getClientName(clientId: number): string {
    const c = this.clients.find(cl => cl.id === clientId);
    return c ? c.denomination_sociale : `Client #${clientId}`;
  }

  /** Step 3 : génération effective */
  genererRedevancesAnnuelles(): void {
    if (!this.canGenerate()) return;

    if (!this.hasSelection()) {
      this.snack.open('Aucune redevance sélectionnée.', 'Fermer', { duration: 3000 });
      return;
    }

    const payload: GenererRedevanceRequest = {
      annee: this.f.annee.value ?? undefined,
      categorie_produit: this.f.categorie.value ?? undefined,
      client: this.f.client.value ?? undefined,
      signataire: this.f.signataire.value ?? undefined,
      redevances: this.selectedRedevances   // ✅ getter, plus d’affectation
    };

    console.log('Redevances sélectionnées pour génération :', this.selectedRedevances);
    console.log('Payload envoyé au backend :', payload);

    this.isLoading = true;

    this.factureService.genererRedevancesAnnuelles(payload)
      .pipe(
        take(1),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          this.generated = true;
          this.form.disable({ emitEvent: false });

          const nb = res?.resultat ?? 0;
          const msg = `${res?.message} (${nb} redevance(s) générée(s))`;

          this.msgMessageService.success(msg);
          this.snack.open(msg, 'OK', { duration: 4000 });
        },
        error: (err) => {
          const msg = err?.error?.message || 'Échec de la génération. Réessayez.';
          this.dialogService.alert({ message: msg });
          this.snack.open(msg, 'Fermer', { duration: 4000 });
        }
      });
  }


  fermer(): void {
    this.router.navigate(['/facturation/generation-redevances']); // adapte l’URL à ton routing
  }
}
