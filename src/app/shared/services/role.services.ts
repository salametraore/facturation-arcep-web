import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Operation, RequestPostRole, Role} from "../models/droits-utilisateur";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private baseUrl = environment.baseUrl +'/roles';

  constructor(private http: HttpClient) { }


  create(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/`, role);
  }

  getListItems(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}/`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  creerRoleAvecOperations(requestPostRole: RequestPostRole): Observable<RequestPostRole> {
    return this.http.post<RequestPostRole>(`${this.baseUrl}/`, requestPostRole);
  }

  getListeOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${environment.baseUrl}/operations/`);
  }

}
