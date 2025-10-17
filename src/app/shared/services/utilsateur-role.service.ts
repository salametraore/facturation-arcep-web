import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {UtilisateurRole} from "../models/droits-utilisateur";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UtilisateurRoleRoleService {

  private baseUrl = environment.baseUrl +'/role-utilisateurs';

  constructor(private http: HttpClient) { }


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
