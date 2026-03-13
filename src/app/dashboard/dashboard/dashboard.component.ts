import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DirectionsService } from "../../shared/services/directions.services";
import {
  StatistiquesDashboardDirections,
  FicheParStatut,
  DevisParEtat,
  DevisParClient,
  FactureParEtat,
  FactureParClient
} from '../../shared/models/statistiques-dashboard-directions.model';
import {AuthService} from "../../authentication/auth.service";



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  errorMessage = '';
  directionId!: number;

  stats: StatistiquesDashboardDirections | null = null;

  fichesParStatut: FicheParStatut[] = [];
  devisParEtat: DevisParEtat[] = [];
  devisParClient: DevisParClient[] = [];
  facturesParEtat: FactureParEtat[] = [];
  facturesParClient: FactureParClient[] = [];

  devisParClientTop: DevisParClient[] = [];
  facturesParClientTop: FactureParClient[] = [];

  readonly fichesColumns: string[] = ['statut_code', 'statut_libelle', 'nombre'];
  readonly devisEtatColumns: string[] = ['etat', 'nombre', 'montant'];
  readonly devisClientColumns: string[] = ['client', 'nombre', 'montant'];
  readonly facturesEtatColumns: string[] = ['etat', 'nombre', 'montant'];
  readonly facturesClientColumns: string[] = ['client', 'nombre', 'montant'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly directionsService: DirectionsService,
  private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.getConnectedUser();
    const rawDir = Number(u?.direction);

    const dir = rawDir === 0 || rawDir === 100 ? 1 : rawDir;

    if (!Number.isInteger(dir) || dir <= 0) {
      this.errorMessage = 'Identifiant de direction invalide.';
      this.stats = null;
      this.resetDataSources();
      return;
    }

    this.directionId = dir;
    this.loadData();
  }

  loadData(): void {
    if (!Number.isInteger(this.directionId) || this.directionId <= 0) {
      this.errorMessage = 'Identifiant de direction invalide.';
      this.stats = null;
      this.resetDataSources();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.directionsService
      .getStatistiquesByDirection(this.directionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stats = response;

          this.fichesParStatut = response.fiches_par_statut ?? [];
          this.devisParEtat = response.devis_par_etat ?? [];
          this.devisParClient = response.devis_par_client ?? [];
          this.facturesParEtat = response.factures_par_etat ?? [];
          this.facturesParClient = response.factures_par_client ?? [];

          this.devisParClientTop = [...this.devisParClient]
            .sort((a, b) => b.montant - a.montant)
            .slice(0, 10);

          this.facturesParClientTop = [...this.facturesParClient]
            .sort((a, b) => b.montant - a.montant)
            .slice(0, 10);

          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement statistiques direction', error);
          this.errorMessage = 'Impossible de charger les statistiques de la direction.';
          this.stats = null;
          this.resetDataSources();
          this.loading = false;
        }
      });
  }

  private resetDataSources(): void {
    this.fichesParStatut = [];
    this.devisParEtat = [];
    this.devisParClient = [];
    this.facturesParEtat = [];
    this.facturesParClient = [];
    this.devisParClientTop = [];
    this.facturesParClientTop = [];
  }


  get nombreFiches(): number {
    return this.stats?.nombre_fiches ?? 0;
  }

  get nombreDevis(): number {
    return this.stats?.nombre_devis ?? 0;
  }

  get montantDevis(): number {
    return this.stats?.montant_devis ?? 0;
  }

  get nombreFactures(): number {
    return this.stats?.nombre_factures ?? 0;
  }

  get montantFactures(): number {
    return this.stats?.montant_factures ?? 0;
  }

  get nombreProduits(): number {
    return this.stats?.nombre_produits ?? 0;
  }

  get nombreClients(): number {
    return this.stats?.nombre_clients ?? 0;
  }

  trackByStatut(_index: number, item: FicheParStatut): string {
    return item.statut_code;
  }

  trackByEtat(_index: number, item: DevisParEtat | FactureParEtat): string {
    return item.etat;
  }

  trackByClient(
    _index: number,
    item: DevisParClient | FactureParClient
  ): number {
    return item.client__id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
