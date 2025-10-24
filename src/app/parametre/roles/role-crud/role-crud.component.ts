import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Role} from '../../../shared/models/droits-utilisateur';
import {Operation} from '../../../shared/models/droits-utilisateur';
import {RoleService} from '../../../shared/services/role.services';

@Component({
  selector: 'role-crud',
  templateUrl: './role-crud.component.html',
  styleUrls: ['./role-crud.component.scss']
})
export class RoleCrudComponent implements OnInit {

  title = 'Nouveau rôle';
  form!: FormGroup;

  allOps: Operation[] = [];
  left: Operation[] = [];
  right: Operation[] = [];

  selectedLeft: Operation[] = [];
  selectedRight: Operation[] = [];

  constructor(
    private fb: FormBuilder,
    private service: RoleService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<RoleCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null
  ) {
  }

  ngOnInit(): void {
    this.title = this.data?.id ? 'Modifier le rôle' : 'Nouveau rôle';

    // ✅ Initialisation du FormGroup ici (corrige l’erreur fb used before initialization)
    this.form = this.fb.group({
      code: [this.data?.code || ''],
      libelle: [this.data?.libelle || '', Validators.required]
    });

    // Récupération des opérations
    this.service.getListeOperations().subscribe(ops => {
      this.allOps = ops;

      const raw = this.data?.operations ?? [];

      const selectedIdList = raw.map((x: any) => typeof x === 'number' ? x : x.id);
      const selectedIds = new Set<number>(selectedIdList);

      this.right = ops.filter(o => selectedIds.has(o.id));
      this.left = ops.filter(o => !selectedIds.has(o.id));
    });
  }

  // --- Gestion des transferts droite/gauche ---
  toRightSelected() {
    this.right = [...this.right, ...this.selectedLeft];
    const ids = new Set(this.selectedLeft.map(o => o.id));
    this.left = this.left.filter(o => !ids.has(o.id));
    this.selectedLeft = [];
  }

  toLeftSelected() {
    this.left = [...this.left, ...this.selectedRight];
    const ids = new Set(this.selectedRight.map(o => o.id));
    this.right = this.right.filter(o => !ids.has(o.id));
    this.selectedRight = [];
  }

  toRightAll() {
    this.right = [...this.right, ...this.left];
    this.left = [];
    this.selectedLeft = [];
  }

  toLeftAll() {
    this.left = [...this.left, ...this.right];
    this.right = [];
    this.selectedRight = [];
  }

  // --- Enregistrement ---
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Objet pour l’UI (conforme à ton type Role actuel)
    const roleUI: Role = {
      id: this.data?.id,
      code: this.form.value.code,
      libelle: this.form.value.libelle,
      operations: this.right,                 // <-- Operation[]
    };

    // Payload pour l’API (IDs) :
    const payload = {
      id: roleUI.id,
      code: roleUI.code,
      libelle: roleUI.libelle,
      operations: this.right.map(o => o.id),  // <-- number[]
    };

    const req$ = roleUI.id
      ? this.service.update(roleUI.id, payload as any) // payload pour l’API
      : this.service.create(payload as any);

    req$.subscribe({
      next: _ => {
        this.snack.open('Rôle enregistré avec succès', 'OK', {duration: 2000});
        this.ref.close(true);
      },
      error: _ => this.snack.open('Erreur lors de l’enregistrement', 'Fermer', {duration: 3000})
    });
  }

  close() {
    this.ref.close(false);
  }
}
