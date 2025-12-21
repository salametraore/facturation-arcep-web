import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RcvSeedLoaderService {
  private STORAGE_KEY = 'RCV_DB_V2';

  constructor(private http: HttpClient) {}

  async initFromAssetsOnce(assetPath = '/assets/mocks/rcv-mock-db.json'): Promise<void> {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (existing) return;

    const seed = await this.http.get<any>(assetPath).toPromise();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  get storageKey(): string { return this.STORAGE_KEY; }
}
