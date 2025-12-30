// src\app\parametre\clients\clients-crud\clients-crud.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Client, ClientRequest } from '../../../shared/models/client';
import { ClientService } from '../../../shared/services/client.service';

// ,
//   styleUrls: ['./clients-crud.component.scss']

@Component({
  selector: 'app-clients-crud',
  templateUrl: './clients-crud.component.html'
})
export class ClientsCrudComponent implements OnInit {
  form!: FormGroup;

  loading = false;
  saving = false;

  id: number | null = null;
  isNew = true;

  constructor(
    private fb: FormBuilder,
    private api: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    this.isNew = !this.id;

    this.buildForm();

    if (!this.isNew && this.id) {
      this.load(this.id);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      // Identité
      denomination_sociale: ['', Validators.required],
      type: ['', Validators.required],
      ifu: [null],
      rccm: ['', Validators.required],
      first_name: [''],
      last_name: [''],

      // Comptes
      compte_comptable: [null],
      compte_banque: [null],

      // Contact
      email: [''],
      adresse: ['', Validators.required],
      telephone: ['', Validators.required],
      qualite: [''],
      telephone_rep_legal: [null],
      email_rep_legal: [null],

      // Web / Geo
      site_web: [null],
      google_maps: [null],
      longitude: [null],
      latitude: [null],

      // Flags
      strategique: [false],
      mauvais_payeur: [false],
      litige: [false],

      // (optionnel) si tu veux gérer utilisateur côté UI
      utilisateur: [null]
    });
  }

  private load(id: number): void {
    this.loading = true;
    this.api.getItem(id).subscribe({
      next: (c: Client) => {
        // patchValue ignore les champs absents dans le form -> ok
        this.form.patchValue(c);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  cancel(): void {
    // Depuis /parametre/clients/new ou /parametre/clients/:id
    // ../ => /parametre/clients
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ClientRequest = this.form.value as ClientRequest;

    this.saving = true;

    if (this.isNew) {
      this.api.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.cancel();
        },
        error: () => (this.saving = false)
      });
      return;
    }

    if (this.id) {
      this.api.update(this.id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.cancel();
        },
        error: () => (this.saving = false)
      });
    }
  }

  // Optionnel : helper pour le template
  get f() {
    return this.form.controls;
  }
}
