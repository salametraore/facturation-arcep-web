import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AppConfigService } from '../core/config/app-config.service';
import {
  AccessPayload,
  ScopedResource,
  AccessRoleScope
} from './access.models';
import { MenuItem } from '../core/menu/menu-items';
import {OperationRequest} from "../shared/models/operation.model";

@Injectable({ providedIn: 'root' })
export class AuthzService {
  private readonly ACCESS_KEY = 'rbac_access';
  private readonly OPERATIONS_KEY = 'user_operations';

  private readonly initialAccess = this.readFromSession();

  private readonly _access = signal<AccessPayload | null>(this.initialAccess);
  private readonly _operationCodes = signal<string[]>(
    this.readOperationCodesFromSession(this.initialAccess)
  );

  readonly access = computed(() => this._access());
  readonly accessLoaded = computed(() => this._access() !== null);
  readonly user = computed(() => this._access()?.user ?? null);
  readonly roles = computed(() => this._access()?.roles ?? []);
  readonly operations = computed(() => this._access()?.operations ?? []);
  readonly operationCodes = computed(() => this._operationCodes());
  readonly operationCodesSet = computed(() => new Set(this._operationCodes()));

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get apiUrl(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  private readFromSession(): AccessPayload | null {
    const raw = sessionStorage.getItem(this.ACCESS_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AccessPayload;
    } catch {
      sessionStorage.removeItem(this.ACCESS_KEY);
      return null;
    }
  }

  private extractOperationCodes(operations: OperationRequest[] | null | undefined): string[] {
    if (!Array.isArray(operations)) {
      return [];
    }

    return operations
      .map(op => String(op?.code ?? '').trim())
      .filter(code => !!code);
  }

  private readOperationCodesFromSession(fallbackAccess?: AccessPayload | null): string[] {
    const raw = sessionStorage.getItem(this.OPERATIONS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((x: any) => typeof x === 'string' && !!x.trim());
        }
      } catch {
        sessionStorage.removeItem(this.OPERATIONS_KEY);
      }
    }

    return this.extractOperationCodes(fallbackAccess?.operations);
  }

  private normalizeAccessPayload(raw: any): AccessPayload {
    const roles = Array.isArray(raw?.roles) ? raw.roles : [];

    const operations: OperationRequest[] = Array.isArray(raw?.operations)
      ? raw.operations
        .map((op: any) => {
          if (typeof op === 'string') {
            return { code: op, libelle: op } as OperationRequest;
          }

          return {
            code: op?.code,
            libelle: op?.libelle ?? op?.code ?? '',
            fonctionnalite_id: op?.fonctionnalite_id
          } as OperationRequest;
        })
        .filter((op: OperationRequest) => !!op.libelle || !!op.code)
      : [];

    return {
      ...(raw ?? {}),
      roles,
      operations
    } as AccessPayload;
  }

  setAccess(payload: AccessPayload | null): void {
    this._access.set(payload);

    const codes = this.extractOperationCodes(payload?.operations);
    this._operationCodes.set(codes);

    if (payload) {
      sessionStorage.setItem(this.ACCESS_KEY, JSON.stringify(payload));
      sessionStorage.setItem(this.OPERATIONS_KEY, JSON.stringify(codes));
    } else {
      sessionStorage.removeItem(this.ACCESS_KEY);
      sessionStorage.removeItem(this.OPERATIONS_KEY);
    }
  }

  clear(): void {
    this.setAccess(null);
  }

  refreshAccess(): Observable<AccessPayload> {
    return this.http.get<any>(`${this.apiUrl}/auth/me/access/`).pipe(
      map((raw: any) => this.normalizeAccessPayload(raw)),
      tap((data: AccessPayload) => {
        this.setAccess(data);
      })
    );
  }

  ensureAccessLoaded(): Observable<AccessPayload | null> {
    const current = this._access();
    if (current) {
      return of(current);
    }

    return this.refreshAccess().pipe(
      map((data) => data ?? null),
      catchError(() => {
        this.clear();
        return of(null);
      })
    );
  }

  getStoredOperations(): OperationRequest[] {
    return [...this.operations()];
  }

  getStoredOperationCodes(): string[] {
    return [...this._operationCodes()];
  }

  has(operationCode: string): boolean {
    return this.operationCodesSet().has(operationCode);
  }

  hasAny(operationCodes: string[] | null | undefined): boolean {
    if (!operationCodes?.length) {
      return true;
    }

    const set = this.operationCodesSet();
    return operationCodes.some(code => set.has(code));
  }

  hasAll(operationCodes: string[] | null | undefined): boolean {
    if (!operationCodes?.length) {
      return true;
    }

    const set = this.operationCodesSet();
    return operationCodes.every(code => set.has(code));
  }

  canRoute(requiredAny?: string[] | null, requiredAll?: string[] | null): boolean {
    return this.hasAny(requiredAny) && this.hasAll(requiredAll);
  }

  canOnResource(
    operationCode: string,
    resource?: ScopedResource | null
  ): boolean {
    if (!this.has(operationCode)) {
      return false;
    }

    if (!resource) {
      return true;
    }

    const roles = this.roles();
    if (!roles.length) {
      return false;
    }

    return roles.some(role => this.roleMatchesResource(role, resource));
  }

  canAnyOnResource(
    operationCodes: string[] | null | undefined,
    resource?: ScopedResource | null
  ): boolean {
    if (!operationCodes?.length) {
      return true;
    }

    return operationCodes.some(code => this.canOnResource(code, resource));
  }

  canAllOnResource(
    operationCodes: string[] | null | undefined,
    resource?: ScopedResource | null
  ): boolean {
    if (!operationCodes?.length) {
      return true;
    }

    return operationCodes.every(code => this.canOnResource(code, resource));
  }

  private roleMatchesResource(role: AccessRoleScope, resource: ScopedResource): boolean {
    if ((role as any)?.is_global) {
      return true;
    }

    const directionOk =
      (role as any)?.direction_id == null ||
      resource?.direction_id == null ||
      Number((role as any).direction_id) === Number(resource.direction_id);

    const produitOk =
      (role as any)?.produit_id == null ||
      (resource as any)?.produit_id == null ||
      Number((role as any).produit_id) === Number((resource as any).produit_id);

    return directionOk && produitOk;
  }

  filterMenu(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.isMenuItemVisible(item))
      .map(item => ({
        ...item,
        sous_menus: item.sous_menus ? this.filterMenu(item.sous_menus) : null
      }))
      .filter(item => item.feuille === 1 || (item.sous_menus?.length ?? 0) > 0);
  }

  private isMenuItemVisible(item: MenuItem): boolean {
    if ((item as any)?.actif !== 'OUI') {
      return false;
    }

    return this.canRoute(
      (item as any)?.requiredAny ?? null,
      (item as any)?.requiredAll ?? null
    );
  }
}
