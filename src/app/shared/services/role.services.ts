import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Operation, RequestPostRole, Role } from '../models/droits-utilisateur';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class RoleService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URLs normalisées */
  private get urlRoles(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/roles`;
  }
  private get urlOperations(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/operations`;
  }

  create(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.urlRoles}/`, role);
  }

  getListItems(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.urlRoles}/`);
  }

  getItem(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.urlRoles}/${id}/`);
  }

  update(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.urlRoles}/${id}/`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlRoles}/${id}/`);
  }

  creerRoleAvecOperations(requestPostRole: RequestPostRole): Observable<RequestPostRole> {
    return this.http.post<RequestPostRole>(`${this.urlRoles}/`, requestPostRole);
  }

  getListeOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.urlOperations}/`);
  }
}
