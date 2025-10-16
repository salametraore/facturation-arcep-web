import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Utilisateur} from "../models/utilisateur";
import {environment} from "../../../environments/environment";
import {UtilisateurRole} from "../models/droits-utilisateur";

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private baseUrl = environment.baseUrl +'/utilisateurs';
  private baseUrl2 = environment.baseUrl +'/role-utilisateurs';

  constructor(private http: HttpClient) { }


  create(Utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.baseUrl}/`, Utilisateur);
  }

  getListItems(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, Utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.baseUrl}/${id}/`, Utilisateur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  getUtilisateurRoles(id: number): Observable<UtilisateurRole> {
    return this.http.get<UtilisateurRole>(`${this.baseUrl2}/${id}/`);
  }

}
