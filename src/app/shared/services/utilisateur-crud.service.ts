// src/app/shared/services/utilisateur-crud.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Utilisateur,UtilisateurRole,
  UtilisateurRequest,
  UtilisateurUpdateRequest,
  utilisateurToUpdateRequest,
} from '../models/utilisateur.model';


import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class UtilisateurCrudService {
  constructor(private http: HttpClient, private cfg: AppConfigService) {}

  /** Bases normalisées */
  private get base(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }
  private get urlUsers(): string {
    return `${this.base}/utilisateurs`;
  }
  private get urlUserRoles(): string {
    return `${this.base}/role-utilisateurs`;
  }

  /** CREATE (attend UtilisateurRequest, retourne Utilisateur) */
  create(payload: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.urlUsers}/`, payload);
  }

  /** LIST */
  getListItems(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.urlUsers}/`);
  }

  /** GET by id */
  getItem(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.urlUsers}/${id}/`);
  }

  /** UPDATE (PUT) - généralement sans password */
  update(id: number, payload: UtilisateurUpdateRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.urlUsers}/${id}/`, payload);
  }


  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlUsers}/${id}/`);
  }

  /** Rôles d’un user-role record (si ton endpoint est /role-utilisateurs/{id}/) */
  getUtilisateurRoles(id: number): Observable<UtilisateurRole> {
    return this.http.get<UtilisateurRole>(`${this.urlUserRoles}/${id}/`);
  }

  /** LIST user-role records (⚠️ c’est un tableau) */
  getUtilisateursRoles(): Observable<UtilisateurRole[]> {
    return this.http.get<UtilisateurRole[]>(`${this.urlUserRoles}/`);
  }

  /**
   * GET user par username
   * ⚠️ adapte selon ton backend : souvent c’est /utilisateurs/by-username/{username}/
   */
  getUtilisateurByUsername(username: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.urlUsers}/by-username/${encodeURIComponent(username)}/`);
  }

  /**
   * Helper: convertir un Utilisateur (réponse) -> payload update
   * (utile pour tes composants)
   */
  toUpdateRequest(u: Utilisateur): UtilisateurUpdateRequest {
    return utilisateurToUpdateRequest(u);
  }

  /**
   * Alternative: créer avec rôles (même endpoint que create)
   * -> on garde une méthode “alias” si tu veux être explicite
   */
  creerUtilisateurAvecRoles(payload: UtilisateurRequest): Observable<Utilisateur> {
    return this.create(payload);
  }
}
