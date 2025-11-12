import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AvisEtudeTechnique, ChercheFiche,
  FicheTechniques,
  MiseAJourStatutFiche,
  RetraitAutorisationRequest
} from '../models/ficheTechniques';
import { ElementFacturationRecuCreeList } from '../models/element-facturation-recu-cree-list';
import { FicheTechniqueAFacturer } from '../models/fiche-technique-a-facturer';
import { WorkflowHistory } from '../models/workflowHistory';
import { HistoriqueFicheTechnique } from '../models/historique-traitement-fiche-technique';

import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class FicheTechniquesService {

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Helper: assemble les segments sans doubles // */
  private joinUrl(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p, i) => i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+|\/+$/g,''))
      .join('/');
  }

  // --- Bases d’URL centralisées ---
  private get urlFiches()          { return this.joinUrl(this.cfg.baseUrl, 'fiche-techniques'); }
  private get urlChangeStatut()    { return this.joinUrl(this.cfg.baseUrl, 'change-statut-fiche'); }
  private get urlElemRecuCree()    { return this.joinUrl(this.cfg.baseUrl, 'elements-facturation-recu-cree'); }
  private get urlHistoriqueApi()   { return this.joinUrl(this.cfg.baseUrl, 'api', 'historique'); }
  private get urlWorkflowHistory() { return this.joinUrl(this.cfg.baseUrl, 'workflow-history'); }
  private get urlUpdateAvis()      { return this.joinUrl(this.cfg.baseUrl, 'update-avis-fiche-technique'); }
  private get urlRetrait()         { return this.joinUrl(this.cfg.baseUrl, 'retrait-fiche-technique'); }

  // --- CRUD Fiches techniques ---
  getItem(id: number): Observable<FicheTechniques> {
    return this.http.get<FicheTechniques>(`${this.urlFiches}/${id}`);
  }

  create(ficheTechniqueData: FormData): Observable<FicheTechniques> {
    return this.http.post<FicheTechniques>(`${this.urlFiches}/`, ficheTechniqueData);
  }

  update(id: number, ficheTechniqueData: FormData): Observable<FicheTechniques> {
    return this.http.put<FicheTechniques>(`${this.urlFiches}/${id}/`, ficheTechniqueData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlFiches}/${id}/`, { responseType: 'text' });
  }

  getListItems(): Observable<FicheTechniques[]> {
    return this.http.get<FicheTechniques[]>(`${this.urlFiches}/`);
  }

  getListeFichesTechniquesByClientId(id: number): Observable<FicheTechniques[]> {
    return this.http.get<FicheTechniques[]>(`${this.urlFiches}/clients/${id}/`);
  }

  // --- Actions spécifiques ---
  setAvis(avis: AvisEtudeTechnique): Observable<AvisEtudeTechnique> {
    return this.http.post<AvisEtudeTechnique>(`${this.urlUpdateAvis}/`, avis);
  }

  retraitAutorisation(req: RetraitAutorisationRequest): Observable<RetraitAutorisationRequest> {
    return this.http.post<RetraitAutorisationRequest>(`${this.urlRetrait}/`, req);
  }

  setStatutFiche(m: MiseAJourStatutFiche): Observable<MiseAJourStatutFiche> {
    return this.http.post<MiseAJourStatutFiche>(`${this.urlChangeStatut}/`, m);
  }

  // --- Eléments de facturation / reçus ---
  getElementFacturationRecu(id: number): Observable<FicheTechniqueAFacturer> {
    return this.http.get<FicheTechniqueAFacturer>(`${this.urlElemRecuCree}/${id}/`);
  }

  getElementFacturationRecus(): Observable<ElementFacturationRecuCreeList[]> {
    return this.http.get<ElementFacturationRecuCreeList[]>(`${this.urlElemRecuCree}/`);
  }

  // --- Recherche multi-critères ---
  getFicheTechniques(chercheFiche?: ChercheFiche): Observable<FicheTechniques[]> {
    let params = new HttpParams();

    if (chercheFiche?.categorie_produit)
      params = params.set('categorie_produit', String(chercheFiche.categorie_produit));
    if (chercheFiche?.client)
      params = params.set('client', String(chercheFiche.client));
    if (chercheFiche?.direction)
      params = params.set('direction', String(chercheFiche.direction));
    if (chercheFiche?.statut)
      params = params.set('statut', String(chercheFiche.statut));
    if (chercheFiche?.date_debut)
      params = params.set('date_debut', chercheFiche.date_debut);
    if (chercheFiche?.date_fin)
      params = params.set('date_fin', chercheFiche.date_fin);

    return this.http.get<FicheTechniques[]>(this.urlFiches, { params });
  }

  // --- Historique & workflow ---
  getWorkflowHistoryById(id_fiche: number): Observable<WorkflowHistory[]> {
    return this.http.get<WorkflowHistory[]>(`${this.urlWorkflowHistory}/${id_fiche}/`);
  }

  getHistoriqueTraitementFicheTechnique(ficheId: number): Observable<HistoriqueFicheTechnique[]> {
    return this.http.get<HistoriqueFicheTechnique[]>(`${this.urlHistoriqueApi}-fiche/${ficheId}/`);
  }
}
