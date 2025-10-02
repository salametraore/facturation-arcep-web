import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  FicheTechniques,
  MiseAJourStatutFiche,
  RequestGenererFacture
} from "../models/ficheTechniques";
import {ElementFacturationRecuCreeList} from "../models/element-facturation-recu-cree-list";
import {FicheTechniqueAFacturer} from "../models/fiche-technique-a-facturer";

@Injectable({providedIn: 'root',})
export class FicheTechniquesService {
  private baseUrl = environment.baseUrl + '/fiche-techniques';
  private baseUrl_1 = environment.baseUrl + '/change-statut-fiche';
  private baseUrl_2 = environment.baseUrl + '/elements-facturation-recu-cree';

  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<FicheTechniques> {
    return this.http.get<FicheTechniques>(`${this.baseUrl}/${id}`);
  }

  create(ficheTechniqueData: FormData): Observable<FicheTechniques> {
    console.log('--- Contenu du FormData ---');
    for (const pair of (ficheTechniqueData as any).entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    return this.http.post<FicheTechniques>(`${this.baseUrl}/`, ficheTechniqueData);
  }

  update(id: number, ficheTechniqueData: FormData): Observable<FicheTechniques> {
    return this.http.put<FicheTechniques>(`${this.baseUrl}/${id}/`, ficheTechniqueData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {responseType: 'text'});
  }

  getListItems(): Observable<FicheTechniques[]> {
    return this.http.get<FicheTechniques[]>(`${this.baseUrl}`);
  }

  getElementFacturationRecu(id:number): Observable<FicheTechniqueAFacturer> {
    return this.http.get<FicheTechniqueAFacturer>(`${this.baseUrl_2}/${id}/`);
  }

  getElementFacturationRecus(): Observable<ElementFacturationRecuCreeList[]> {
    return this.http.get<ElementFacturationRecuCreeList[]>(`${this.baseUrl_2}`);
  }

  getFicheTechniques(categorie_produit?: number, client?: number, direction?: number, statut?: number, date_debut?: string, date_fin?: string, count: boolean = false): Observable<FicheTechniques[]> {
    let params = new HttpParams();

    if (categorie_produit) {
      params.set('categorie_produit', categorie_produit?.toString())
    }
    if (client)
      params.set('client', client?.toString())
    if (direction)
      params.set('direction', direction?.toString())
    if (statut)
      params.set('statut', statut?.toString())
    if (date_debut)
      params.set('date_debut', date_debut)
    if (date_fin)
      params.set('date_fin', date_fin)
    params.set('count', count.toString());

    return this.http.get<FicheTechniques[]>(this.baseUrl, {params});
  }
 setStatutFiche(miseAJourStatutFiche: MiseAJourStatutFiche): Observable<MiseAJourStatutFiche> {
    return this.http.post<MiseAJourStatutFiche>(`${this.baseUrl_1}/`, miseAJourStatutFiche);
  }
}
