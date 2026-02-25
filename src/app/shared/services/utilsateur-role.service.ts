import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UtilisateurRole } from '../models/droits-utilisateur';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class UtilisateurRoleService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base normalisée: {baseUrl}/role-utilisateurs */
  private get baseUrl(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/role-utilisateurs`;
  }

  create(utilisateurRole: UtilisateurRole): Observable<UtilisateurRole> {
    return this.http.post<UtilisateurRole>(`${this.baseUrl}/`, utilisateurRole);
  }

  getListItems(): Observable<UtilisateurRole[]> {
    return this.http.get<UtilisateurRole[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<UtilisateurRole> {
    return this.http.get<UtilisateurRole>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, utilisateurRole: UtilisateurRole): Observable<UtilisateurRole> {
    return this.http.put<UtilisateurRole>(`${this.baseUrl}/${id}/`, utilisateurRole);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
