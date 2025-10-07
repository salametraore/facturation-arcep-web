import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Produit} from 'src/app/shared/models/produit';

@Injectable({providedIn: 'root',})
export class ProduitService {
  private baseUrl = environment.baseUrl + '/produits';

  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/${id}/`);
  }

  create(data: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/`, data);
  }

  update(id: number, value: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/${id}/`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {responseType: 'text'});
  }

  getListItems(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/`);
  }

  getListeProduitsByDirection(directionId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/direction/${directionId}/`);
  }

}
