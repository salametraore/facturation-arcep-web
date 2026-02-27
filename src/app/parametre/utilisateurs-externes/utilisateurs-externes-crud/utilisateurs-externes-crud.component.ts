// src/app/type-directions/pages/type-direction/utilisateurs-externes-crud/utilisateurs-externes-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { bouton_names, operations } from '../../../constantes';

import { Utilisateur, UtilisateurRequest, UtilisateurUpdateRequest } from '../../../shared/models/utilisateur.model';
import { Client } from '../../../shared/models/client';
import { ClientService } from '../../../shared/services/client.service';

import { UtilisateurCrudService } from '../../../shared/services/utilisateur-crud.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'utilisateurs-externes-crud',
  templateUrl: './utilisateurs-externes-crud.component.html',
  styleUrls: ['./utilisateurs-externes-crud.component.scss']
})
export class UtilisateursExternesCrudComponent implements OnInit {

  utilisateur?: Utilisateur | null;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' utilisateur';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  // ✅ clients + autocomplete
  clients: Client[] = [];
  clientSearchCtrl = new FormControl<Client | string>('');
  filteredClients$!: Observable<Client[]>;

  // ✅ rôle portail
  portailRoles: Array<'PORTAIL_CONSULTATION' | 'PORTAIL_PAIEMENT'> = [
    'PORTAIL_CONSULTATION',
    'PORTAIL_PAIEMENT'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private utilisateurService: UtilisateurCrudService,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<UtilisateursExternesCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    this.utilisateur = data.utilisateur;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadClients();
    console.log('Init Crud utilisateur externes')
    console.log(this.utilisateur);

    if (this.isDetails()) {
      this.clientSearchCtrl.disable({ emitEvent: false });
    }
  }

  init(): void {
    if (this.utilisateur && this.data_operation === this.operations.update) {
      this.mode = this.data_operation;
      this.title = 'Mise à jour';
      this.initForm_update();
    } else if (!this.utilisateur && this.data_operation === this.operations.create) {
      this.mode = this.data_operation;
      this.title = 'Ajout';
      this.initForm_create();
    } else if (this.utilisateur && this.data_operation === this.operations.details) {
      this.mode = this.data_operation;
      this.title = 'Détails';
      this.initForm_update();
      this.form.disable();
    }

    this.title = `${this.title} - ${this.window_name}`;
  }

  private initForm_update(): void {
    this.form = this.fb.group({
      id: [this.utilisateur?.id],
      username: [this.utilisateur?.username, [Validators.required, Validators.maxLength(150)]],
      last_name: [this.utilisateur?.last_name ?? '', [Validators.maxLength(150)]],
      first_name: [this.utilisateur?.first_name ?? '', [Validators.maxLength(150)]],
      telephone: [this.utilisateur?.telephone ?? null, [Validators.maxLength(20)]],
      email: [this.utilisateur?.email ?? '', [Validators.email, Validators.maxLength(254)]],

      // ✅ obligatoire pour CLIENT
      client_id: [this.utilisateur?.client ?? null, [Validators.required]],

      // ✅ obligatoire, défaut consultation
      portail_role: [this.utilisateur?.portail_role ?? 'PORTAIL_CONSULTATION', [Validators.required]],

      // hidden : ne pas toucher en update
      nature: [this.utilisateur?.nature ?? 'CLIENT'],

      // hidden : si backend attend encore
      liste_roles: [[]]
    });
  }

  private initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      username: ['', [Validators.required, Validators.maxLength(150)]],
      last_name: ['', [Validators.maxLength(150)]],
      first_name: ['', [Validators.maxLength(150)]],
      telephone: [null, [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(254)]],

      // ✅ obligatoire
      client_id: [null, [Validators.required]],

      // ✅ défaut
      portail_role: ['PORTAIL_CONSULTATION', [Validators.required]],

      // ✅ hidden nature
      nature: ['CLIENT'],

      // ✅ password par défaut non affiché
      password: ['Facture2026', [Validators.required]],

      // hidden : si backend attend encore
      liste_roles: [[]]
    });
  }

  isDetails(): boolean {
    return this.data_operation === this.operations.details;
  }

  // ---------- Autocomplete clients ----------
  private loadClients(): void {
    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients ?? [];

      this.filteredClients$ = this.clientSearchCtrl.valueChanges.pipe(
        startWith(''),
        map(v => this.filterClients(typeof v === 'string' ? v : (v?.denomination_sociale ?? '')))
      );

      // Pré-remplissage en update/details
      const cid = this.form?.get('client_id')?.value;
      if (cid) {
        const found = this.clients.find(c => c.id === cid);
        if (found) this.clientSearchCtrl.setValue(found, { emitEvent: false });
      }
    });
  }

  private filterClients(q: string): Client[] {
    const s = this.norm(q);
    if (!s) return (this.clients ?? []).slice(0, 50);

    return (this.clients ?? [])
      .filter(c => {
        const hay = this.norm(`${c.id} ${c.denomination_sociale ?? ''} ${c.rccm ?? ''} ${c.ifu ?? ''}`);
        return hay.includes(s);
      })
      .slice(0, 50);
  }

  displayClient = (c?: Client | string | null): string => {
    if (!c) return '';
    if (typeof c === 'string') return c;
    return c.denomination_sociale ? `${c.denomination_sociale} (ID:${c.id})` : `Client #${c.id}`;
  };

  onClientPicked(e: MatAutocompleteSelectedEvent): void {
    const client = e.option.value as Client;
    if (!client?.id) return;

    this.form.get('client_id')?.setValue(client.id);
    this.form.get('client_id')?.markAsDirty();
    this.form.get('client_id')?.markAsTouched();
  }

  onClientBlur(): void {
    // si l’utilisateur tape sans choisir, on force la validation du client_id
    this.form.get('client_id')?.markAsTouched();
    this.form.get('client_id')?.updateValueAndValidity({ emitEvent: false });
  }

  private norm(v: any): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  // ---------- CRUD ----------
  crud(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    // CREATE
    if (this.mode === operations.create) {
      const payload: UtilisateurRequest = {
        username: v.username,
        last_name: v.last_name || undefined,
        first_name: v.first_name || undefined,
        telephone: v.telephone ?? null,
        email: v.email || undefined,

        nature: v.nature ?? 'CLIENT',
        client: v.client_id,
        portail_role: v.portail_role ?? 'PORTAIL_CONSULTATION',

        // password par défaut
        password: v.password,

        // si backend attend encore
        liste_roles: v.liste_roles ?? []
      };

      this.utilisateurService.create(payload).subscribe(
        () => {
          this.msgMessageService.success('Utilisateur enregistré avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
      return;
    }

    // UPDATE : ✅ ne touche pas au password / nature
    if (this.mode === operations.update) {
      const payload: UtilisateurUpdateRequest = {
        username: v.username,
        last_name: v.last_name || undefined,
        first_name: v.first_name || undefined,
        telephone: v.telephone ?? null,
        email: v.email || undefined,

        client: v.client_id,
        portail_role: v.portail_role ?? 'PORTAIL_CONSULTATION',

        // si backend attend encore
        liste_roles: v.liste_roles ?? []
      };

      this.utilisateurService.update(v.id, payload).subscribe(
        () => {
          this.msgMessageService.success('Utilisateur mis à jour avec succès');
          this.dialogRef.close('Yes');
        },
        (error) => {
          this.dialogService.alert({ message: error?.error?.message ?? error });
          this.errorMessage = error?.error?.message ?? error;
        }
      );
      return;
    }
  }
}
