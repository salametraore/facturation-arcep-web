import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Utilisateur } from '../models/utilisateur';
import { RequestPostUtilisateur, UtilisateurRole } from '../models/droits-utilisateur';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Bases normalisées */
  private get urlUsers(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/utilisateurs`;
  }
  private get urlUserRoles(): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}/role-utilisateurs`;
  }

  create(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.urlUsers}/`, utilisateur);
  }

  getListItems(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.urlUsers}/`);
  }

  getItem(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.urlUsers}/${id}/`);
  }

  update(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.urlUsers}/${id}/`, utilisateur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlUsers}/${id}/`);
  }

  getUtilisateurRoles(id: number): Observable<UtilisateurRole> {
    return this.http.get<UtilisateurRole>(`${this.urlUserRoles}/${id}/`);
  }

  getUtilisateursRoles(): Observable<UtilisateurRole> {
    return this.http.get<UtilisateurRole>(`${this.urlUserRoles}/`);
  }

  getUtisateurByUsername(username: string): Observable<Utilisateur> {
    // Si l’API attend /utilisateurs/by-username/{username}/, adapte ici
    return this.http.get<Utilisateur>(`${this.urlUsers}/${username}/`);
  }

  creerUtilisateurAvecRoles(request: RequestPostUtilisateur): Observable<RequestPostUtilisateur> {
    return this.http.post<RequestPostUtilisateur>(`${this.urlUsers}/`, request);
  }
}
