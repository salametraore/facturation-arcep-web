import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Direction } from '../models/direction';
import { AppConfigService } from '../../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class DirectionService {

  private readonly resource = 'directions';

  constructor(
    private http: HttpClient,
    private cfg: AppConfigService
  ) {}

  private get baseUrl(): string {
    const base = this.cfg.baseUrl.replace(/\/$/, '');
    const res  = this.resource.replace(/^\/|\/$/g, '');
    return `${base}/${res}`;
  }

  getItem(id: number): Observable<Direction> {
    return this.http.get<Direction>(`${this.baseUrl}/${id}`);
  }

  create(data: Direction): Observable<Direction> {
    return this.http.post<Direction>(`${this.baseUrl}`, data);
  }

  update(id: number, value: Direction): Observable<Direction> {
    return this.http.put<Direction>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  getListItems(): Observable<Direction[]> {
    return this.http.get<Direction[]>(`${this.baseUrl}/`);
  }
}
