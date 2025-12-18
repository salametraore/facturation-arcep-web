// /shared/services/cv-mock.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RcvMockService {
  constructor(private http: HttpClient) {}

  loadDb(): Observable<any> {
    return this.http.get('/assets/mocks/rcv-mock-db.json');
  }

  loadViews(): Observable<any> {
    return this.http.get('/assets/mocks/rcv-views.json');
  }
}
