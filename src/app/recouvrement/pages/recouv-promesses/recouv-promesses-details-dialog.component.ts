import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { finalize, map, startWith, take } from 'rxjs/operators';

import {
  RcvPromessesApi,
  RcvPromesseEnriched,
  RcvPromesseStatut
} from '../../../rcv/endpoints/rcv-promesses.api';

import { ClientService } from '../../../shared/services/client.service';
import { Client } from '../../../shared/models/client';

import { FactureService } from '../../../shared/services/facture.service';
import { Facture } from '../../../shared/models/facture';

export interface RecouvPromesseDetailsDialogData {
  mode: 'create' | 'edit';
  id?: number;
}

@Component({
  selector: 'app-recouv-promesses-details-dialog',
  templateUrl: './recouv-promesses-details-dialog.component.html',
  styleUrls: ['./recouv-promesses-details-dialog.component.scss']
})
export class RecouvPromessesDetailsDialogComponent implements OnInit {
  loading = false;
  saving = false;

  clients: Client[] = [];

  // Autocomplete client
  clientCtrl = new FormControl<string | Client>('');
  filteredClients$: Observable<Client[]> = of([]);

  // Autocomplete facture (disabled tant que client non choisi)
  factureCtrl = new FormControl<string | Facture>({ value: '', disabled: true });
  filteredFactures$: Observable<Facture[]> = of([]);
  facturesClient: Facture[] = [];

  promesse: RcvPromesseEnriched | null = null;

  statuts: RcvPromesseStatut[] = ['EN_COURS', 'RESPECTEE', 'NON_RESPECTEE'];

  edit = {
    client_id: null as number | null,
    facture_id: null as number | null,
    montant: 0,
    date_promesse: '',
    statut: 'EN_COURS' as RcvPromesseStatut
  };

  constructor(
    private api: RcvPromessesApi,
    private clientSrv: ClientService,
    private factureSrv: FactureService,
    private ref: MatDialogRef<RecouvPromessesDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecouvPromesseDetailsDialogData
  ) {}

  ngOnInit(): void {
    this.clientSrv.getItems().subscribe({
      next: (clients) => {
        this.clients = clients || [];

        this.filteredClients$ = this.clientCtrl.valueChanges.pipe(
          startWith(''),
          map(v => this.filterClients(v))
        );

        // si promesse déjà chargée avant la fin du chargement des clients
        if (this.promesse?.client_id) {
          const selected = this.clients.find(x => x.id === this.promesse!.client_id);
          if (selected) {
            this.clientCtrl.setValue(selected, { emitEvent: false });
          }
        }
      },
      error: (e) => console.error(e)
    });

    this.filteredFactures$ = this.factureCtrl.valueChanges.pipe(
      startWith(''),
      map(v => this.filterFactures(v))
    );

    if (this.data.mode === 'edit') {
      this.reload();
    } else {
      this.initCreate();
    }
  }

  // =========================
  // displayWith
  // =========================
  displayClient = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    const c = value as Client;
    const denom = c.denomination_sociale ?? '';
    const cc = c.compte_comptable ?? c.ifu ?? '';
    return cc ? `${denom} — ${cc}` : denom;
  };

  getFactureMontantAffiche(f: Facture | null | undefined): number {
    if (!f) return 0;

    const factureAny = f as any;
    const raw =
      factureAny.montant_restant ??
        factureAny.solde_restant ??
          factureAny.reste_a_payer ??
            f.montant ??
              0;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  displayFacture = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    const f = value as Facture;
    return f.reference ?? (f.id != null ? `Facture #${f.id}` : '');
  };

  // =========================
  // filtering
  // =========================
  private filterClients(val: string | Client | null): Client[] {
    const s = (typeof val === 'string' ? val : this.displayClient(val)).toLowerCase().trim();
    if (!s) return this.clients.slice(0, 20);

    return this.clients
      .filter(c => {
        const denom = String(c.denomination_sociale ?? '').toLowerCase();
        const cc = String(c.compte_comptable ?? '').toLowerCase();
        const ifu = String(c.ifu ?? '').toLowerCase();
        const id = String(c.id ?? '');
        return denom.includes(s) || cc.includes(s) || ifu.includes(s) || id.includes(s);
      })
      .slice(0, 20);
  }

  private filterFactures(val: string | Facture | null): Facture[] {
    const s = (typeof val === 'string' ? val : this.displayFacture(val)).toLowerCase().trim();
    if (!s) return this.facturesClient.slice(0, 20);

    return this.facturesClient
      .filter(f => {
        const ref = String(f.reference ?? '').toLowerCase();
        const id = String(f.id ?? '');
        return ref.includes(s) || id.includes(s);
      })
      .slice(0, 20);
  }

  // =========================
  // montant depuis facture
  // =========================
  private getMontantPromesseFromFacture(f: Facture | null): number {
    if (!f) return 0;

    const raw =
      (f as any).montant_restant ??
        (f as any).solde_restant ??
          (f as any).reste_a_payer ??
            f.montant ??
              0;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  // =========================
  // client / facture selection
  // =========================
  onClientSelected(c: Client): void {
    const newClientId = c?.id ?? null;

    if (this.edit.client_id === newClientId) return;

    this.edit.client_id = newClientId;

    // reset facture
    this.edit.facture_id = null;
    this.edit.montant = 0;
    this.facturesClient = [];
    this.factureCtrl.setValue('', { emitEvent: false });

    if (!this.edit.client_id) {
      this.factureCtrl.disable({ emitEvent: false });
      return;
    }

    this.factureCtrl.enable({ emitEvent: false });
    this.loadFacturesForClient(this.edit.client_id, null);
  }

  onFactureSelected(f: Facture | null): void {
    this.edit.facture_id = f?.id ?? null;

    if (f) {
      // ✅ affectation automatique du montant de la facture à la promesse
      this.edit.montant = this.getMontantPromesseFromFacture(f);
      return;
    }

    // si on efface la facture en création
    if (this.data.mode === 'create') {
      this.edit.montant = 0;
    }
  }

  clearClient(): void {
    this.clientCtrl.setValue('', { emitEvent: true });
    this.edit.client_id = null;

    this.edit.facture_id = null;
    this.edit.montant = 0;

    this.facturesClient = [];
    this.factureCtrl.setValue('', { emitEvent: false });
    this.factureCtrl.disable({ emitEvent: false });
  }

  clearFacture(): void {
    this.edit.facture_id = null;
    this.factureCtrl.setValue('', { emitEvent: true });

    if (this.data.mode === 'create') {
      this.edit.montant = 0;
    }
  }

  private loadFacturesForClient(clientId: number, preselectFactureId: number | null): void {
    this.factureSrv.getListeFacturesByClientId(clientId).subscribe({
      next: (rows) => {
        const all = rows || [];

        // factures impayées selon ta règle actuelle
        this.facturesClient = all.filter(f =>
          String(f.etat || '').toUpperCase() === 'EMISE' &&
          Number(f.montant ?? 0) > 0
        );

        // préselection en mode edit
        if (preselectFactureId) {
          const match = this.facturesClient.find(f => f.id === preselectFactureId) || null;
          if (match) {
            this.edit.facture_id = match.id ?? null;
            this.factureCtrl.setValue(match, { emitEvent: false });

            // en édition, on conserve le montant existant de la promesse
            // pour éviter d’écraser une valeur déjà enregistrée
          }
        }
      },
      error: (e) => {
        console.error(e);
        this.facturesClient = [];
      }
    });
  }

  // =========================
  // init / reload
  // =========================
  private initCreate(): void {
    const iso = new Date().toISOString().slice(0, 10);
    this.promesse = null;

    this.edit = {
      client_id: null,
      facture_id: null,
      montant: 0,
      date_promesse: iso,
      statut: 'EN_COURS'
    };

    this.factureCtrl.disable({ emitEvent: false });
    this.factureCtrl.setValue('', { emitEvent: false });
    this.facturesClient = [];
  }

  reload(): void {
    if (!this.data.id) {
      this.ref.close(false);
      return;
    }

    this.loading = true;
    this.api.getById(this.data.id).pipe(
      take(1),
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (p) => {
        this.promesse = p;

        this.edit = {
          client_id: p.client_id,
          facture_id: p.facture_id ?? null,
          montant: Number(p.montant ?? 0),
          date_promesse: p.date_promesse,
          statut: p.statut
        };

        const selectedClient = this.clients.find(x => x.id === p.client_id);
        if (selectedClient) {
          this.clientCtrl.setValue(selectedClient, { emitEvent: false });
        }

        if (p.client_id) {
          this.factureCtrl.enable({ emitEvent: false });
          this.loadFacturesForClient(p.client_id, p.facture_id ?? null);
        } else {
          this.factureCtrl.disable({ emitEvent: false });
        }
      },
      error: (err) => {
        console.error(err);
        this.ref.close(false);
      }
    });
  }

  // =========================
  // labels
  // =========================
  clientLabel(): string {
    if (this.data.mode === 'create') {
      return this.edit.client_id ? `Client #${this.edit.client_id}` : '(non défini)';
    }

    const p = this.promesse;
    return p?.client?.denomination
      ?? (p as any)?.client?.denomination_sociale
        ?? `Client #${p?.client_id}`;
  }

  factureLabel(): string {
    if (this.data.mode === 'create') {
      return this.edit.facture_id ? `Facture #${this.edit.facture_id}` : 'Promesse globale';
    }

    if (!this.promesse?.facture_id) return 'Promesse globale';
    return this.promesse?.facture?.reference ?? `Facture #${this.promesse?.facture_id}`;
  }

  // =========================
  // save
  // =========================
  save(): void {
    this.saving = true;

    if (this.data.mode === 'create') {
      if (!this.edit.client_id) {
        this.saving = false;
        return;
      }

      this.api.create({
        client_id: this.edit.client_id,
        facture_id: this.edit.facture_id || null,
        montant: this.edit.montant,
        date_promesse: this.edit.date_promesse,
        statut: this.edit.statut
      })
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => this.ref.close(true),
          error: (err) => console.error(err)
        });

      return;
    }

    if (!this.promesse) {
      this.saving = false;
      return;
    }

    this.api.update(this.promesse.id, {
      montant: this.edit.montant,
      date_promesse: this.edit.date_promesse,
      statut: this.edit.statut,
      facture_id: this.edit.facture_id || null
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.ref.close(true),
        error: (err) => console.error(err)
      });
  }

  close(): void {
    this.ref.close(false);
  }
}
