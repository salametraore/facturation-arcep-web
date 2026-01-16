import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectionListChange } from '@angular/material/list';
import { Role, RoleRequest } from '../../../shared/models/role.model';
import { Operation } from '../../../shared/models/operation.model';
import { RoleService } from '../../../shared/services/role.services';

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
  ) {}

  ngOnInit(): void {
    this.title = this.data?.id ? 'Modifier le rôle' : 'Nouveau rôle';

    this.form = this.fb.group({
      code: [this.data?.code || ''],
      libelle: [this.data?.libelle || '', Validators.required]
    });

    // Récupération des opérations
    this.service.getListeOperations().subscribe((ops: Operation[]) => {
      this.allOps = ops ?? [];

      // Si data.operations existe, c'est Operation[] (nouveau modèle)
      const selectedIds = new Set<number>((this.data?.operations ?? []).map(o => o.id));

      this.right = this.allOps.filter(o => selectedIds.has(o.id));
      this.left  = this.allOps.filter(o => !selectedIds.has(o.id));
    });
  }

  // --- Gestion transferts ---
  toRightSelected(): void {
    this.right = [...this.right, ...this.selectedLeft];
    const ids = new Set(this.selectedLeft.map(o => o.id));
    this.left = this.left.filter(o => !ids.has(o.id));
    this.selectedLeft = [];
  }


  onLeftSelectionChange(e: MatSelectionListChange): void {
    this.selectedLeft = e.source.selectedOptions.selected.map(s => s.value);
  }

  onRightSelectionChange(e: MatSelectionListChange): void {
    this.selectedRight = e.source.selectedOptions.selected.map(s => s.value);
  }


  toLeftSelected(): void {
    this.left = [...this.left, ...this.selectedRight];
    const ids = new Set(this.selectedRight.map(o => o.id));
    this.right = this.right.filter(o => !ids.has(o.id));
    this.selectedRight = [];
  }

  toRightAll(): void {
    this.right = [...this.right, ...this.left];
    this.left = [];
    this.selectedLeft = [];
  }

  toLeftAll(): void {
    this.left = [...this.left, ...this.right];
    this.right = [];
    this.selectedRight = [];
  }

  // --- Enregistrement ---
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RoleRequest = {
      code: this.form.value.code,
      libelle: this.form.value.libelle,
      liste_operations: (this.right ?? []).map(o => o.id)
    };

    const req$ = this.data?.id
      ? this.service.update(this.data.id, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: _ => {
        this.snack.open('Rôle enregistré avec succès', 'OK', { duration: 2000 });
        this.ref.close(true);
      },
      error: _ => this.snack.open('Erreur lors de l’enregistrement', 'Fermer', { duration: 3000 })
    });
  }

  close(): void {
    this.ref.close(false);
  }
}
