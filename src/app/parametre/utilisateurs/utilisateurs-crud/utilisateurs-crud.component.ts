// src/app/type-directions/pages/type-direction/utilisateurs-crud/utilisateurs-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { bouton_names, operations } from '../../../constantes';

import {
  Utilisateur,
  UtilisateurRequest,
  UtilisateurUpdateRequest
} from '../../../shared/models/utilisateur.model';

import { Role } from '../../../shared/models/role.model';
import { TypeDirection } from '../../../shared/models/typeDirection';

import { UtilisateurCrudService } from '../../../shared/services/utilisateur-crud.service';
import { TypeDirectionsService } from '../../../shared/services/type-directions.services';
import { RoleService } from '../../../shared/services/role.services';

import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';

@Component({
  selector: 'app-utilisateurs-crud',
  templateUrl: './utilisateurs-crud.component.html'
})
export class UtilisateursCrudComponent implements OnInit {

  utilisateur?: Utilisateur | null;

  form!: FormGroup;

  mode: string = '';
  title: string = '';
  window_name = ' utilisateur';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;

  roles: Role[] = [];
  typeDirections: TypeDirection[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private utilisateurService: UtilisateurCrudService,
    private roleService: RoleService,
    private typeDirectionsService: TypeDirectionsService,
    public dialogRef: MatDialogRef<UtilisateursCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService
  ) {
    this.utilisateur = data.utilisateur;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    this.init();
    this.loadData();
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
      this.form.disable(); // ✅ tout en lecture seule
    }

    this.title = `${this.title} - ${this.window_name}`;
  }

  loadData(): void {
    // rôles
    this.roleService.getListItems().subscribe((roles: Role[]) => {
      this.roles = roles ?? [];
    });

    // directions
    this.typeDirectionsService.getItems().subscribe((dirs: TypeDirection[]) => {
      this.typeDirections = dirs ?? [];
    });
  }

  initForm_update(): void {
    this.form = this.fb.group({
      id: [this.utilisateur?.id],
      username: [this.utilisateur?.username, [Validators.required, Validators.maxLength(150)]],
      last_name: [this.utilisateur?.last_name ?? '', [Validators.maxLength(150)]],
      first_name: [this.utilisateur?.first_name ?? '', [Validators.maxLength(150)]],
      telephone: [this.utilisateur?.telephone ?? null, [Validators.maxLength(20)]],
      email: [this.utilisateur?.email ?? '', [Validators.email, Validators.maxLength(254)]],
      direction: [this.utilisateur?.direction ?? null],

      // multi-select rôles : on stocke des IDs
      liste_roles: [(this.utilisateur?.roles_detail ?? []).map(r => r.id), Validators.required],

      // optionnel en update (si tu veux permettre reset)
      password: ['']
    });
  }

  initForm_create(): void {
    this.form = this.fb.group({
      id: [''],
      username: ['', [Validators.required, Validators.maxLength(150)]],
      last_name: ['', [Validators.maxLength(150)]],
      first_name: ['', [Validators.maxLength(150)]],
      telephone: [null, [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(254)]],
      direction: [null],

      liste_roles: [[], Validators.required],

      // obligatoire en create
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  /** utile pour le template */
  isDetails(): boolean {
    return this.data_operation === this.operations.details;
  }

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
        direction: v.direction ?? null,
        password: v.password,
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

    // UPDATE
    if (this.mode === operations.update) {
      const payload: UtilisateurUpdateRequest = {
        username: v.username,
        last_name: v.last_name || undefined,
        first_name: v.first_name || undefined,
        telephone: v.telephone ?? null,
        email: v.email || undefined,
        direction: v.direction ?? null,
        liste_roles: v.liste_roles ?? []
      };

      // si password renseigné, on l’envoie (si backend l’accepte)
      if (v.password && String(v.password).trim().length > 0) {
        payload.password = v.password;
      }

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

  getDirectionLibelle(id: number | null | undefined): string {
    if (!id) return '';
    return this.typeDirections?.find(d => d.id === id)?.libelle ?? '';
  }

  compareById(a: any, b: any): boolean {
    return a === b;
  }
}
