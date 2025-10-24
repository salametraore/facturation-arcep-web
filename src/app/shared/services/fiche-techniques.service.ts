import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  AvisEtudeTechnique, ChercheFiche,
  FicheTechniques,
  MiseAJourStatutFiche,
  RequestGenererFacture, RetraitAutorisationRequest
} from "../models/ficheTechniques";
import {ElementFacturationRecuCreeList} from "../models/element-facturation-recu-cree-list";
import {FicheTechniqueAFacturer} from "../models/fiche-technique-a-facturer";
import {Client} from "../models/client";
import {WorkflowHistory} from "../models/workflowHistory";
import {HistoriqueFicheTechnique} from "../models/historique-traitement-fiche-technique";
import {RecouvListeEncaissement} from "../models/recouv-liste-encaissement";

@Injectable({providedIn: 'root',})
export class FicheTechniquesService {
  private baseUrl = environment.baseUrl + '/fiche-techniques';
  private baseUrl_1 = environment.baseUrl + '/change-statut-fiche';
  private baseUrl_2 = environment.baseUrl + '/elements-facturation-recu-cree';
  private baseUrl_histo = environment.baseUrl + '/api/historique/';


  constructor(private http: HttpClient) {
  }

  getItem(id: number): Observable<FicheTechniques> {
    return this.http.get<FicheTechniques>(`${this.baseUrl}/${id}`);
  }

  setAvis(avisEtudeTechnique: AvisEtudeTechnique): Observable<AvisEtudeTechnique> {
    return this.http.post<AvisEtudeTechnique>(`${environment.baseUrl}/update-avis-fiche-technique/`, avisEtudeTechnique);
  }

  retraitAutorisation(retraitAutorisationRequest: RetraitAutorisationRequest): Observable<RetraitAutorisationRequest> {
    return this.http.post<RetraitAutorisationRequest>(`${environment.baseUrl}/retrait-fiche/`, retraitAutorisationRequest);
  }

  create(ficheTechniqueData: FormData): Observable<FicheTechniques> {
    return this.http.post<FicheTechniques>(`${this.baseUrl}/`, ficheTechniqueData);
  }

  update(id: number, ficheTechniqueData: FormData): Observable<FicheTechniques> {
    return this.http.put<FicheTechniques>(`${this.baseUrl}/${id}/`, ficheTechniqueData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {responseType: 'text'});
  }

  getListItems(): Observable<FicheTechniques[]> {
    return this.http.get<FicheTechniques[]>(`${this.baseUrl}/`);
  }

  getElementFacturationRecu(id:number): Observable<FicheTechniqueAFacturer> {
    return this.http.get<FicheTechniqueAFacturer>(`${this.baseUrl_2}/${id}/`);
  }

  getElementFacturationRecus(): Observable<ElementFacturationRecuCreeList[]> {
    return this.http.get<ElementFacturationRecuCreeList[]>(`${this.baseUrl_2}/`);
  }

  getFicheTechniques(chercheFiche?:ChercheFiche): Observable<FicheTechniques[]> {
    console.log(chercheFiche);
    let params = new HttpParams();

    if (chercheFiche?.categorie_produit) {
      params.set('categorie_produit', chercheFiche?.categorie_produit?.toString())
    }
    if (chercheFiche?.client)
      params.set('client', chercheFiche?.client?.toString())
    if (chercheFiche?.direction)
      params.set('direction', chercheFiche?.direction?.toString())
    if (chercheFiche?.statut)
      params.set('statut', chercheFiche?.statut?.toString())
    if (chercheFiche?.date_debut)
      params.set('date_debut', chercheFiche?.date_debut)
    if (chercheFiche?.date_fin)
      params.set('date_fin', chercheFiche?.date_fin)

    return this.http.get<FicheTechniques[]>(this.baseUrl, {params});
  }


 setStatutFiche(miseAJourStatutFiche: MiseAJourStatutFiche): Observable<MiseAJourStatutFiche> {
    return this.http.post<MiseAJourStatutFiche>(`${this.baseUrl_1}/`, miseAJourStatutFiche);
  }

  getWorkflowHistoryById(id_fiche:number): Observable<WorkflowHistory[]> {
    return this.http.get<WorkflowHistory[]>(`${environment.baseUrl}/workflow-history/${id_fiche}/`);
  }

  getHistoriqueTraitementFicheTechnique(ficheId: number): Observable<HistoriqueFicheTechnique[]> {
    return  this.http.get<HistoriqueFicheTechnique[]>(`${environment.baseUrl}/api/historique-fiche/${ficheId}/`);
  }

  getListeFichesTechniquesByClientId(id:number) : Observable<FicheTechniques[]> {
    return this.http.get<FicheTechniques[]>(`${this.baseUrl}/clients/${id}/`);
  }
}
