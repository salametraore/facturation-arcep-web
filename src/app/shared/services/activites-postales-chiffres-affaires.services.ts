import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategorieProduit } from '../models/categorie-produit';
import {
  ChiffreAffairePostale,
  ChiffreAffairePostaleCreateWithFileRequest, ValiderChiffreAffairePostalRequest
} from '../models/activites-postales-chiffres-affaires';
import { AppConfigService } from '../../core/config/app-config.service';
import {Client} from "../models/client";

@Injectable({ providedIn: 'root' })
export class ActivitesPostalesChiffresAffairesService {

  /** segment d’API (toujours sans slash de début/fin) */
  private readonly resource = 'activites-postales-chiffres-affaires';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  /** Base URL normalisée: {baseUrl}/{resource} (sans doubles slash) */
  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');          // retire slash final s'il existe
    const res  = this.resource.replace(/^\/|\/$/g, '');        // retire slashes début/fin
    return `${base}/${res}`;
  }


  InitierChiffreAffaire(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/initier/`, formData);
  }

  getListItems(): Observable<ChiffreAffairePostale[]> {
    return this.http.get<ChiffreAffairePostale[]>(`${this.baseUrl}/`);
  }

  getItem(id: number): Observable<ChiffreAffairePostale> {
    return this.http.get<ChiffreAffairePostale>(`${this.baseUrl}/${id}/`);
  }

  create(chiffreAffairePostale: ChiffreAffairePostale): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, chiffreAffairePostale);
  }


  update(id: number, chiffreAffairePostale: ChiffreAffairePostale): Observable<ChiffreAffairePostale> {
    return this.http.put<ChiffreAffairePostale>(`${this.baseUrl}/${id}/`, chiffreAffairePostale);
  }

  validerChiffreAffairePostal( validerChiffreAffairePostalRequest: ValiderChiffreAffairePostalRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/update-generer-fiche/`, validerChiffreAffairePostalRequest);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }


}
