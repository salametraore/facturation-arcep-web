import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import {
  RcvPromessesApi,
  RcvPromesseEnriched,
  RcvPromesseStatut
} from '../../../rcv/endpoints/rcv-promesses.api';

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

  promesse: RcvPromesseEnriched | null = null;

  statuts: RcvPromesseStatut[] = ['EN_COURS', 'RESPECTEE', 'NON_RESPECTEE'];

  // champs éditables (+ client_id / facture_id pour la création)
  edit = {
    client_id: null as number | null,
    facture_id: null as number | null,
    montant: 0,
    date_promesse: '',
    statut: 'EN_COURS' as RcvPromesseStatut
  };

  constructor(
    private api: RcvPromessesApi,
    private ref: MatDialogRef<RecouvPromessesDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecouvPromesseDetailsDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.mode === 'edit') this.reload();
    else this.initCreate();
  }

  private initCreate(): void {
    // valeurs par défaut
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);

    this.promesse = null;
    this.edit = {
      client_id: null,
      facture_id: null,
      montant: 0,
      date_promesse: iso,
      statut: 'EN_COURS'
    };
  }

  reload(): void {
    if (!this.data.id) { this.ref.close(false); return; }

    this.loading = true;
    this.api.getById(this.data.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: p => {
          this.promesse = p;
          this.edit = {
            client_id: p.client_id,
            facture_id: p.facture_id ?? null,
            montant: p.montant,
            date_promesse: p.date_promesse,
            statut: p.statut
          };
        },
        error: err => {
          console.error(err);
          this.ref.close(false);
        }
      });
  }

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

  save(): void {
    this.saving = true;

    if (this.data.mode === 'create') {
      // validations minimales
      if (!this.edit.client_id) { this.saving = false; return; }

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
          error: err => console.error(err)
        });

      return;
    }

    // edit
    if (!this.promesse) { this.saving = false; return; }

    this.api.update(this.promesse.id, {
      montant: this.edit.montant,
      date_promesse: this.edit.date_promesse,
      statut: this.edit.statut,
      facture_id: this.edit.facture_id || null
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.ref.close(true),
        error: err => console.error(err)
      });
  }

  close(): void {
    this.ref.close(false);
  }
}
