// src/app/shared/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Operation } from '../models/operation.model';
import { Role, RoleRequest } from '../models/role.model';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class RoleService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get base(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  private get urlRoles(): string {
    return `${this.base}/roles`;
  }
  private get urlOperations(): string {
    return `${this.base}/operations`;
  }

  /** CREATE : backend attend RoleRequest */
  create(payload: RoleRequest): Observable<Role> {
    return this.http.post<Role>(`${this.urlRoles}/`, payload);
  }

  getListItems(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.urlRoles}/`);
  }

  getItem(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.urlRoles}/${id}/`);
  }

  /** UPDATE : backend attend RoleRequest */
  update(id: number, payload: RoleRequest): Observable<Role> {
    return this.http.put<Role>(`${this.urlRoles}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRoles}/${id}/`);
  }

  /** LIST opérations */
  getListeOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.urlOperations}/`);
  }
}
