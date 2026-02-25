import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { Role, RoleRequest } from '../../../shared/models/role.model';
import { Operation } from '../../../shared/models/operation.model';
import { RoleService } from '../../../shared/services/role.services';

type Side = 'LEFT' | 'RIGHT';

@Component({
  selector: 'role-crud',
  templateUrl: './role-crud.component.html',
  styleUrls: ['./role-crud.component.scss']
})
export class RoleCrudComponent implements OnInit {

  title = 'Nouveau rôle';

  form!: FormGroup;

  /** Flags UI */
  loadingOps = false;
  saving = false;

  /** Données opérations */
  allOps: Operation[] = [];
  left: Operation[] = [];   // disponibles
  right: Operation[] = [];  // affectées au rôle

  /** Vues filtrées (maître) */
  leftView: Operation[] = [];
  rightView: Operation[] = [];

  /** Filtres */
  leftFilter = new FormControl('');
  rightFilter = new FormControl('');

  /** Sélections (pour transferts) */
  selectedLeft: Operation[] = [];
  selectedRight: Operation[] = [];

  /** Détail (opération focus) */
  focusedOp: Operation | null = null;
  focusedSide: Side | null = null;

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

    // Refiltrer en temps réel
    this.leftFilter.valueChanges.subscribe(() => this.updateViews(true));
    this.rightFilter.valueChanges.subscribe(() => this.updateViews(true));

    this.loadOperations();
  }

  private loadOperations(): void {
    this.loadingOps = true;

    this.service.getListeOperations()
      .pipe(finalize(() => (this.loadingOps = false)))
      .subscribe((ops: Operation[]) => {
        this.allOps = (ops ?? []).slice().sort(this.sortByLibelle);

        const selectedIds = this.extractSelectedOperationIds(this.data);

        this.right = this.allOps.filter(o => selectedIds.has(o.id));
        this.left = this.allOps.filter(o => !selectedIds.has(o.id));

        this.updateViews(true);
      });
  }

  /**
   * Supporte plusieurs formes possibles selon ton DTO:
   * - data.operations: Operation[]
   * - data.liste_operations: number[]
   */
  private extractSelectedOperationIds(role: any): Set<number> {
    const ids = new Set<number>();

    const fromOpsObjects = role?.operations;
    if (Array.isArray(fromOpsObjects)) {
      for (const o of fromOpsObjects) {
        if (o && typeof o.id === 'number') ids.add(o.id);
      }
    }

    const fromOpsIds = role?.liste_operations;
    if (Array.isArray(fromOpsIds)) {
      for (const id of fromOpsIds) {
        if (typeof id === 'number') ids.add(id);
      }
    }

    return ids;
  }

  // ---------------------------
  // Maître (filtrage + tri)
  // ---------------------------
  private updateViews(clearSelection: boolean): void {
    const lf = this.norm(this.leftFilter.value);
    const rf = this.norm(this.rightFilter.value);

    this.leftView = this.filterOps(this.left, lf);
    this.rightView = this.filterOps(this.right, rf);

    // Tri stable
    this.leftView.sort(this.sortByLibelle);
    this.rightView.sort(this.sortByLibelle);

    // Important UX: si on filtre, éviter de transférer des items "invisibles"
    if (clearSelection) {
      this.selectedLeft = [];
      this.selectedRight = [];
    }
  }

  private filterOps(list: Operation[], f: string): Operation[] {
    if (!f) return list.slice();
    return list.filter(op => {
      const hay = this.norm(`${op?.code ?? ''} ${op?.libelle ?? ''}`);
      return hay.includes(f);
    });
  }

  private norm(v: any): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private sortByLibelle(a: Operation, b: Operation): number {
    const al = (a?.libelle ?? '').toString();
    const bl = (b?.libelle ?? '').toString();
    return al.localeCompare(bl, 'fr', { sensitivity: 'base' });
  }

  trackByOpId(_: number, op: Operation): number {
    return op.id;
  }

  // ---------------------------
  // Détail (focus)
  // ---------------------------
  focus(op: Operation, side: Side): void {
    this.focusedOp = op;
    this.focusedSide = side;
  }

  moveFocused(): void {
    if (!this.focusedOp || !this.focusedSide) return;

    if (this.focusedSide === 'LEFT') {
      this.moveIdsToRight([this.focusedOp.id]);
      this.focusedSide = 'RIGHT';
    } else {
      this.moveIdsToLeft([this.focusedOp.id]);
      this.focusedSide = 'LEFT';
    }
  }

  // ---------------------------
  // Sélections (MatSelectionList)
  // ---------------------------
  onLeftSelectionChange(e: MatSelectionListChange): void {
    this.selectedLeft = e.source.selectedOptions.selected.map(s => s.value);
    // optionnel : focus auto sur le dernier choisi
    const last = this.selectedLeft[this.selectedLeft.length - 1];
    if (last) this.focus(last, 'LEFT');
  }

  onRightSelectionChange(e: MatSelectionListChange): void {
    this.selectedRight = e.source.selectedOptions.selected.map(s => s.value);
    const last = this.selectedRight[this.selectedRight.length - 1];
    if (last) this.focus(last, 'RIGHT');
  }

  // ---------------------------
  // Transferts (robustes : basé sur IDs)
  // ---------------------------
  toRightSelected(): void {
    this.moveIdsToRight(this.selectedLeft.map(o => o.id));
  }

  toLeftSelected(): void {
    this.moveIdsToLeft(this.selectedRight.map(o => o.id));
  }

  toRightAll(): void {
    this.right = this.mergeUnique(this.right, this.left);
    this.left = [];
    this.updateViews(true);
  }

  toLeftAll(): void {
    this.left = this.mergeUnique(this.left, this.right);
    this.right = [];
    this.updateViews(true);
  }

  private moveIdsToRight(ids: number[]): void {
    if (!ids?.length) return;
    const idSet = new Set(ids);

    const moving = this.left.filter(o => idSet.has(o.id));
    this.right = this.mergeUnique(this.right, moving);
    this.left = this.left.filter(o => !idSet.has(o.id));

    this.selectedLeft = [];
    this.updateViews(true);
  }

  private moveIdsToLeft(ids: number[]): void {
    if (!ids?.length) return;
    const idSet = new Set(ids);

    const moving = this.right.filter(o => idSet.has(o.id));
    this.left = this.mergeUnique(this.left, moving);
    this.right = this.right.filter(o => !idSet.has(o.id));

    this.selectedRight = [];
    this.updateViews(true);
  }

  private mergeUnique(target: Operation[], add: Operation[]): Operation[] {
    const map = new Map<number, Operation>();
    for (const o of target ?? []) map.set(o.id, o);
    for (const o of add ?? []) map.set(o.id, o);
    return Array.from(map.values());
  }

  // ---------------------------
  // Save / Close
  // ---------------------------
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

    this.saving = true;

    req$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
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
