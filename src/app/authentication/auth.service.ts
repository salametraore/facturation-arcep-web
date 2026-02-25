import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  LoginPayload, LoginResponse, TwoFaPayload, AuthState, User,
  PasswordResetPayload, PasswordResetConfirmPayload, VerifyResetCodePayload
} from './auth.models';

import { Utilisateur } from '../shared/models/utilisateur';
import { UtilisateurRole } from '../shared/models/droits-utilisateur';

import { AppConfigService } from '../core/config/app-config.service';
import { UtilisateurService } from '../shared/services/utilisateur.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private get apiUrl(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  private authState = new BehaviorSubject<AuthState>(this.getInitialState());
  public authState$ = this.authState.asObservable();

  // ✅ message “à afficher” sur l’écran login (persisté en session)
  private authErrorSubject = new BehaviorSubject<string | null>(
    sessionStorage.getItem('auth_error')
  );
  public authError$ = this.authErrorSubject.asObservable();

  utilisateurConnecte!: Utilisateur;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cfg: AppConfigService,
    private utilisateurService: UtilisateurService
  ) {}

  private getInitialState(): AuthState {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return { isAuthenticated: !!token, token, user };
  }

  private setAuthError(msg: string | null): void {
    this.authErrorSubject.next(msg);
    if (msg) sessionStorage.setItem('auth_error', msg);
    else sessionStorage.removeItem('auth_error');
  }

  // (optionnel) à appeler depuis login.component après affichage du message
  clearAuthError(): void {
    this.setAuthError(null);
  }

  private isPersonnel(util: Utilisateur | null | undefined): boolean {
    return String(util?.nature ?? '').toUpperCase() === 'PERSONNEL';
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    // ✅ on efface les anciens messages
    this.setAuthError(null);

    const url = `${this.apiUrl}/auth/login/`;
    return this.http.post<LoginResponse>(url, payload).pipe(
      catchError(this.handleError)
    );
  }

  verify2fa(payload: TwoFaPayload): Observable<LoginResponse> {
    const url = `${this.apiUrl}/auth/verify-otp/`;
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => {
        if (!response?.token) return;

        // ✅ on pose le token (nécessaire si getItem est protégé)
        this.setToken(response.token, response.user);

        // ✅ charger l'utilisateur complet
        this.utilisateurService.getItem(response.user.id).subscribe({
          next: (util: Utilisateur) => {
            this.utilisateurConnecte = util;

            // ✅ contrôle nature
            if (!this.isPersonnel(util)) {
              this.setAuthError('Cette application est réservée uniquement aux utilisateurs internes.');
              this.logout(); // nettoie + redirige /auth/login
              return;
            }

            // ✅ ok : on continue
            this.setAuthError(null);
            this.setConnectedUser(util);
          },
          error: (err) => {
            // si on ne peut pas récupérer le profil, on bloque par sécurité
            this.setAuthError('Impossible de vérifier le profil utilisateur.');
            this.logout();
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  private setToken(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authState.next({ isAuthenticated: true, token, user });
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setConnectedUser(utilisateur: Utilisateur): void {
    sessionStorage.setItem('UtilisateurConnecte', JSON.stringify(utilisateur));
  }

  getConnectedUser(): Utilisateur | null {
    const s = sessionStorage.getItem('UtilisateurConnecte');
    return s ? (JSON.parse(s) as Utilisateur) : null;
  }

  setConnectedUtilisateurRole(utilisateurRole: UtilisateurRole): void {
    sessionStorage.setItem('utilisateurRole', JSON.stringify(utilisateurRole));
  }

  getConnectedUtilisateurRole(): UtilisateurRole | null {
    const s = sessionStorage.getItem('utilisateurRole');
    return s ? (JSON.parse(s) as UtilisateurRole) : null;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('UtilisateurConnecte');
    sessionStorage.removeItem('utilisateurRole');
    this.authState.next({ isAuthenticated: false, token: null, user: null });
    this.router.navigate(['/auth/login']);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  private isTokenValid(_token: string): boolean {
    return true;
  }

  requestPasswordReset(payload: PasswordResetPayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/`;
    return this.http.post(url, payload).pipe(catchError(this.handleError));
  }

  verifyResetCode(payload: VerifyResetCodePayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/verify-reset-code/`;
    return this.http.post(url, payload).pipe(catchError(this.handleError));
  }

  confirmPasswordReset(payload: PasswordResetConfirmPayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/confirm/`;
    return this.http.post(url, payload).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.error?.message !== undefined) {
        errorMessage = error.error.message || 'Identifiants ou code 2FA incorrects.';
      } else if (error.error?.detail !== undefined) {
        errorMessage = error.error.detail;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = JSON.stringify(error.error ?? {});
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
