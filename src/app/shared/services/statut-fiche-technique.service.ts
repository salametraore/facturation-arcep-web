import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {StatutFicheTechnique} from "../models/statut-fiche-technique";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class StatutFicheTechniqueService {

  private baseUrl = environment.baseUrl + '/statuts-fiche-technique';

  constructor(private http: HttpClient) {}

  // GET all
  getListItems(): Observable<StatutFicheTechnique[]> {
    return this.http.get<StatutFicheTechnique[]>(this.baseUrl);
  }

  // GET by ID
  getItem(id: number): Observable<StatutFicheTechnique> {
    return this.http.get<StatutFicheTechnique>(`${this.baseUrl}${id}/`);
  }

  // CREATE
  create(data: StatutFicheTechnique): Observable<StatutFicheTechnique> {
    return this.http.post<StatutFicheTechnique>(this.baseUrl, data);
  }

  // UPDATE
  update(id: number, data: StatutFicheTechnique): Observable<StatutFicheTechnique> {
    return this.http.put<StatutFicheTechnique>(`${this.baseUrl}${id}/`, data);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}
