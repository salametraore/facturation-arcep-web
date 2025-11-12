import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './app-config.model';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config!: AppConfig;

  constructor(private http: HttpClient) {}

  /** Chargé au bootstrap via APP_INITIALIZER */
  load(): Promise<void> {
    const url = `assets/app-config.json?ts=${Date.now()}`; // anti-cache léger
    return this.http.get<AppConfig>(url).toPromise()
      .then(cfg => { this.config = cfg; })
      .catch(() => {
        // Fallback si le fichier n'est pas trouvé (utile en dev)
        this.config = { baseUrl: 'http://localhost:8000/facturation_api' };
      })
      .then(() => void 0);
  }

  /** Renvoie l'URL sans slash final */
  get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }
}
