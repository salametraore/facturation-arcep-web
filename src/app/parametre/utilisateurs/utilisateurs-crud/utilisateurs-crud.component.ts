// src/app/type-directions/pages/type-direction/utilisateurs-externes-crud/utilisateurs-externes-crud.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ValidationErrors,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
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
import { Direction } from '../../../shared/models/direction';
import { DirectionsService } from '../../../shared/services/directions.services';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { UtilisateurRole } from '../../../shared/models/droits-utilisateur';
import { UtilisateurRoleService } from '../../../shared/services/utilsateur-role.service';

export function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    const len = Array.isArray(v) ? v.length : 0;
    return len >= min ? null : { minArrayLength: { requiredLength: min, actualLength: len } };
  };
}

@Component({
  selector: 'app-utilisateurs-crud',
  templateUrl: './utilisateurs-crud.component.html',
  styleUrls: ['./utilisateurs-crud.component.scss']
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

  // ✅ roles attribuables (retournés par le backend)
  roles: Role[] = [];

  typeDirections: TypeDirection[] = [];
  directions: Direction[] = [];

  // ✅ ids attribuables (set rapide)
  assignableRoleIds = new Set<number>();

  // ✅ catalogue pour affichage table (attribuables + déjà attribués via utilisateurRoles)
  rolesCatalog = new Map<number, Role>();

  /** Autocomplete */
  roleSearchCtrl = new FormControl<Role | string>('');
  filteredRoles$!: Observable<Role[]>;

  /** Table des rôles attribués */
  assignedRolesDS = new MatTableDataSource<Role>([]);
  assignedRolesColumns: string[] = ['libelle', 'code', 'actions'];

  // ✅ rôles déjà attribués à l'utilisateur (via table utilisateur_role)
  utilisateurRoles: UtilisateurRole[] = [];

  // petits flags pour l’ordre de chargement
  private rolesLoaded = false;
  private utilisateurRolesLoaded = false;

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private utilisateurService: UtilisateurCrudService,
    private utilisateurRoleService: UtilisateurRoleService,
    private roleService: RoleService,
    private directionsService: DirectionsService,
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

    // ✅ rendre obligatoire uniquement en create/update (Validators.required sur array n’est pas fiable)
    if (this.data_operation === this.operations.create || this.data_operation === this.operations.update) {
      const rolesCtrl = this.form.get('liste_roles');
      rolesCtrl?.setValidators([minArrayLength(1)]);
      rolesCtrl?.updateValueAndValidity({ emitEvent: false });
    }

    // ✅ si liste_roles change, refresh table
    this.form.get('liste_roles')?.valueChanges.subscribe(() => {
      this.refreshAssignedRolesTable();
    });
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
      this.form.disable(); // lecture seule
    }

    this.title = `${this.title} - ${this.window_name}`;
  }

  loadData(): void {
    // 1) rôles attribuables
    this.roleService.getListItems().subscribe((roles: Role[]) => {
      this.roles = roles ?? [];
      this.assignableRoleIds = new Set(this.roles.map(r => r.id));
      this.rolesLoaded = true;

      this.rebuildRolesCatalog(); // peut être partiel tant que utilisateurRoles pas encore là
      this.initRolesUi();         // autocomplete + table (ok même si table se met à jour ensuite)
    });

    // 2) directions
    this.typeDirectionsService.getItems().subscribe((dirs: TypeDirection[]) => {
      this.typeDirections = dirs ?? [];
    });

    this.directionsService.getItems().subscribe((dirs: Direction[]) => {
      this.directions = dirs ?? [];
    });

    if (this.utilisateur?.username) {
      const uname = (this.utilisateur.username ?? '').trim().toLowerCase();

      this.utilisateurRoleService.getListItems().subscribe((vRoles: UtilisateurRole[]) => {
        const all = vRoles ?? [];

        // ✅ filtre strict sur l'utilisateur (username)
        this.utilisateurRoles = all.filter(ur =>
          (ur?.utilisateur ?? '').trim().toLowerCase() === uname
        );

        this.utilisateurRolesLoaded = true;

        // ✅ injecte les IDs dans le form à partir des utilisateurRoles filtrés
        this.patchListeRolesFromUtilisateurRoles();

        // ✅ reconstruit le catalog + refresh table
        this.rebuildRolesCatalog();
      });

    } else {
      // create: rien à charger
      this.utilisateurRoles = [];
      this.utilisateurRolesLoaded = true;
      this.rebuildRolesCatalog();
    }
  }

  private patchListeRolesFromUtilisateurRoles(): void {
    const ids = this.getUtilisateurRoleIds();

    // si form existe déjà (oui), on patch
    const ctrl = this.form.get('liste_roles');
    if (ctrl) {
      ctrl.setValue(ids);
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity({ emitEvent: true });
    }
  }

  private getUtilisateurRoleIds(): number[] {
    const idsFromUtilisateurRoles = (this.utilisateurRoles ?? [])
      .map(ur => ur?.role?.id)
      .filter((id): id is number => typeof id === 'number');

    if (idsFromUtilisateurRoles.length > 0) return idsFromUtilisateurRoles;

    // fallback si jamais utilisateurRoles n’est pas dispo
    return (this.utilisateur?.roles_detail ?? []).map(r => r.id);
  }

  private rebuildRolesCatalog(): void {
    this.rolesCatalog.clear();

    // 1) rôles attribuables
    for (const r of (this.roles ?? [])) {
      this.rolesCatalog.set(r.id, r);
    }

    // 2) rôles déjà attribués via utilisateurRoles (peuvent ne pas être attribuables)
    for (const ur of (this.utilisateurRoles ?? [])) {
      const role = ur?.role;
      if (role?.id) {
        this.rolesCatalog.set(role.id, role);
      }
    }

    // fallback (au cas où) si utilisateurRoles pas encore chargés
    if (!this.utilisateurRolesLoaded) {
      for (const r of (this.utilisateur?.roles_detail ?? [])) {
        this.rolesCatalog.set(r.id, r);
      }
    }

    if (this.form) this.refreshAssignedRolesTable();
  }

  isRoleAssignable(roleId: number): boolean {
    return this.assignableRoleIds.has(roleId);
  }

  /** À appeler dès que `this.roles` est alimenté ET que le form existe */
  initRolesUi(): void {
    this.refreshAssignedRolesTable();

    this.filteredRoles$ = this.roleSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const q = typeof value === 'string' ? value : (value?.libelle ?? '');
        return this.filterAvailableRoles(q);
      })
    );
  }

  displayRole = (r?: Role | string | null): string => {
    if (!r) return '';
    if (typeof r === 'string') return r;
    return r.code ? `${r.libelle} (${r.code})` : r.libelle;
  };

  private filterAvailableRoles(query: string): Role[] {
    const q = this.norm(query);
    const assignedIds = new Set<number>(this.form.get('liste_roles')?.value ?? []);

    return (this.roles ?? []) // ✅ attribuables seulement
      .filter(r => !assignedIds.has(r.id))
      .filter(r => {
        if (!q) return true;
        const hay = this.norm(`${r.libelle ?? ''} ${r.code ?? ''}`);
        return hay.includes(q);
      })
      .slice()
      .sort((a, b) => (a.libelle ?? '').localeCompare(b.libelle ?? '', 'fr', { sensitivity: 'base' }));
  }

  onRolePicked(e: MatAutocompleteSelectedEvent): void {
    const role = e.option.value as Role;
    this.addRole(role);
  }

  addRole(role: Role): void {
    if (!role?.id || this.isDetails()) return;

    const ctrl = this.form.get('liste_roles');
    const current: number[] = (ctrl?.value ?? []).slice();

    if (!current.includes(role.id)) {
      current.push(role.id);
      ctrl?.setValue(current);
      ctrl?.markAsDirty();
      ctrl?.markAsTouched();
    }

    this.roleSearchCtrl.setValue('');
    this.refreshAssignedRolesTable();
  }

  removeRole(role: Role): void {
    if (!role?.id || this.isDetails()) return;

    // ✅ on n’autorise la suppression que si le rôle est attribuable (présent dans this.roles)
    if (!this.isRoleAssignable(role.id)) {
      this.dialogService.alert({ message: "Vous ne pouvez pas retirer ce rôle." });
      return;
    }

    const ctrl = this.form.get('liste_roles');
    const current: number[] = (ctrl?.value ?? []).slice();

    ctrl?.setValue(current.filter(id => id !== role.id));
    ctrl?.markAsDirty();
    ctrl?.markAsTouched();

    this.refreshAssignedRolesTable();
  }

  private refreshAssignedRolesTable(): void {
    const ids: number[] = this.form.get('liste_roles')?.value ?? [];

    const assigned: Role[] = ids.map(id => {
      return this.rolesCatalog.get(id) ?? ({ id, libelle: `Rôle #${id}` } as any);
    });

    this.assignedRolesDS.data = assigned.slice().sort((a, b) =>
      (a.libelle ?? '').localeCompare(b.libelle ?? '', 'fr', { sensitivity: 'base' })
    );
  }

  private norm(v: any): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
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

      // ✅ hidden, conservé mais on NE L’ENVOIE PAS en UPDATE
      nature: [this.utilisateur?.nature ?? 'PERSONNEL'],

      liste_roles: [this.getUtilisateurRoleIds()],

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

      // ✅ hidden, valeur par défaut
      nature: ['PERSONNEL'],

      liste_roles: [[]],
      password: ['Facture2026', [Validators.required, Validators.minLength(1)]]
    });
  }

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

        // ✅ nature fixé à PERSONNEL
        nature: v.nature ?? 'PERSONNEL',

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

        // 🚫 pas de nature ici
        // 🚫 pas de password ici

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

  getDirectionLibelle(id: number | null | undefined): string {
    if (!id) return '';
    return this.directions?.find(d => d.id === id)?.libelle ?? '';
  }

  compareById(a: any, b: any): boolean {
    return a === b;
  }

}
