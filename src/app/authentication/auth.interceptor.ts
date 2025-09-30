import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Liste des chemins à exclure (peut être étendue facilement)
  private excludedUrls: string[] = [
    '/auth/login',
    '/auth/forgot-password'
  ];

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Vérifie si l'URL contient un des chemins exclus
    const shouldExclude = this.excludedUrls.some(url => request.url.includes(url));

    if (shouldExclude) {
      return next.handle(request);
    }

    // Sinon, ajouter le token s'il existe
    const token = localStorage.getItem('auth_token');

    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });

      return next.handle(cloned);
    }

    // Si pas de token, continuer sans modification
    return next.handle(request);
  }
}
