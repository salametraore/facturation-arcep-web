import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CategorieProduit} from "../models/categorie-produit";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategorieProduitService {

  private baseUrl = environment.baseUrl +'/categories-produits'

  constructor(private http: HttpClient) { }


  create(categorie: CategorieProduit): Observable<CategorieProduit> {
    return this.http.post<CategorieProduit>(`${this.baseUrl}/`, categorie);
  }

  getListItems(): Observable<CategorieProduit[]> {
    return this.http.get<CategorieProduit[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<CategorieProduit> {
    return this.http.get<CategorieProduit>(`${this.baseUrl}/${id}/`);
  }

  update(id: number, categorie: CategorieProduit): Observable<CategorieProduit> {
    return this.http.put<CategorieProduit>(`${this.baseUrl}/${id}/`, categorie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
