import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Direction} from "../models/direction";

@Injectable({
  providedIn: 'root'
})
export class DirectionService {

  private baseUrl = environment.baseUrl + '/directions';

  constructor(private http: HttpClient) {
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
    return this.http.delete(`${this.baseUrl}/${id}`, {responseType: 'text'});
  }

  getListItems(): Observable<Direction[]> {
    return this.http.get<Direction[]>(`${this.baseUrl}/`);
  }
}
