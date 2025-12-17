// src/app/shared/services/frequences-fiche.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  FicheDTOQueryOptions, FicheFrequencesDTO, CalculRecap,
  FicheFrequencesCanal, FicheFrequencesStation, LigneTarifee,
  FicheTechniquesFrequences
} from 'src/app/shared/models/frequences.types';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../../core/config/app-config.service';

export interface FicheListItem {
  id: number;
  client?: number;
  client_nom?: string;
  categorie_produit?: number;
  date_creation?: string;
  objet?: string|null;
  statut?: any|null;
}

@Injectable({ providedIn: 'root' })
export class FrequencesFicheService {


  constructor(private http: HttpClient,    private cfg: AppConfigService) {  }

  // -------- LIST / CREATE / DELETE FICHE (entête) --------
  listFiches(params?: { search?: string; categorie?: number; page?: number; page_size?: number; }): Observable<{ results: FicheListItem[]; count: number; }> {
    let p = new HttpParams();
    if (params?.search)   p = p.set('search', params.search);
    if (params?.categorie) p = p.set('categorie', params.categorie);
    if (params?.page)     p = p.set('page', params.page);
    if (params?.page_size) p = p.set('page_size', params.page_size);
    return this.http.get<{ results: FicheListItem[]; count: number; }>(`${this.cfg.baseUrl}/fiches/`, { params: p });
  }

  createFiche(payload: Partial<FicheTechniquesFrequences>): Observable<FicheTechniquesFrequences> {
    // attendu: { client, categorie_produit, objet?, commentaire? }
    return this.http.post<FicheTechniquesFrequences>(`${this.cfg.baseUrl}/fiches/`, payload);
  }

  deleteFiche(ficheId: number): Observable<void> {
    return this.http.delete<void>(`${this.cfg.baseUrl}/fiches/${ficheId}/`);
  }

  // -------- DTO Fréquences (stations+canaux) --------
  private toParams(opts?: FicheDTOQueryOptions): HttpParams {
    let p = new HttpParams();
    if (opts?.withLines) p = p.set('with_lines', '1');
    if (opts?.recalc)    p = p.set('recalc', '1');
    return p;
  }

  get(ficheId: number, opts?: FicheDTOQueryOptions): Observable<FicheFrequencesDTO> {
    return this.http.get<FicheFrequencesDTO>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences`, { params: this.toParams(opts) });
  }
  put(ficheId: number, dto: FicheFrequencesDTO, opts?: FicheDTOQueryOptions) {
    return this.http.put<FicheFrequencesDTO>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences`, dto, { params: this.toParams(opts) });
  }
  patch(ficheId: number, partial: Partial<FicheFrequencesDTO>, opts?: FicheDTOQueryOptions) {
    return this.http.patch<FicheFrequencesDTO>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences`, partial, { params: this.toParams(opts) });
  }
  delete(ficheId: number) {
    return this.http.delete<void>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences`);
  }



  // -------- (optionnels) autres aides déjà présents --------
  saveStations(ficheId: number, payload: FicheFrequencesStation[]) {
    return this.http.post<FicheFrequencesStation[]>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences/stations`, payload);
  }
  saveCanaux(ficheId: number, payload: FicheFrequencesCanal[]) {
    return this.http.post<FicheFrequencesCanal[]>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences/canaux`, payload);
  }
  calculer(ficheId: number) {
    return this.http.post<CalculRecap>(`${this.cfg.baseUrl}/fiches/${ficheId}/frequences/calcul`, {});
  }
  getLignesTarifees(ficheId: number) {
    return this.http.get<LigneTarifee[]>(`${this.cfg.baseUrl}/fiche-technique-lignes-tarifees/?fiche_technique=${ficheId}`);
  }
  getAndRecalc(ficheId: number) { return this.get(ficheId, { withLines: true, recalc: true }); }
  putAndRecalc(ficheId: number, dto: FicheFrequencesDTO) { return this.put(ficheId, dto, { withLines: true, recalc: true }); }
  patchAndRecalc(ficheId: number, partial: Partial<FicheFrequencesDTO>) { return this.patch(ficheId, partial, { withLines: true, recalc: true }); }
}
