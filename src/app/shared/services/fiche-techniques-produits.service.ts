import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FicheTechniquesProduits} from "../models/ficheTechniquesProduits";

@Injectable({providedIn: 'root',})
export class FicheTechniquesProduitsService {
  private baseUrl = environment.baseUrl + '/fiche-techniques-produits';

  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<FicheTechniquesProduits> {
    return this.http.get<FicheTechniquesProduits>(`${this.baseUrl}/${id}`);
  }

  create(data: FicheTechniquesProduits): Observable<FicheTechniquesProduits> {
    return this.http.post<FicheTechniquesProduits>(`${this.baseUrl}`, data);
  }


  update(id: number, value: FicheTechniquesProduits): Observable<FicheTechniquesProduits> {
    return this.http.put<FicheTechniquesProduits>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {responseType: 'text'});
  }

  getListItems(): Observable<FicheTechniquesProduits[]> {
    return this.http.get<FicheTechniquesProduits[]>(`${this.baseUrl}`);
  }

}
