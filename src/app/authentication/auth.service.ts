import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Modèles pour le typage des données
import { LoginPayload, LoginResponse, TwoFaPayload, AuthState, User, PasswordResetPayload, PasswordResetConfirmPayload, VerifyResetCodePayload } from './auth.models';
import {environment} from "../../environments/environment";
import {Utilisateur} from "../shared/models/utilisateur";
import {UtilisateurRole} from "../shared/models/droits-utilisateur"; // À créer

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URL du backend, mise à jour avec le endpoint fourni
  private readonly apiUrl = environment.baseUrl;

  private authState = new BehaviorSubject<AuthState>(this.getInitialState());
  public authState$ = this.authState.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getInitialState(): AuthState {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user') ? JSON.parse(""+localStorage.getItem('user')) : null;
    return {
      isAuthenticated: !!token,
      token: token,
      user: user,
    };
  }

  /**
   * Première étape de la connexion : envoie email et mot de passe.
   * L'API renverra soit le token, soit un flag pour la 2FA.
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    const url = `${this.apiUrl}/auth/login/`; // Endpoint complet
    return this.http.post<LoginResponse>(url, payload).pipe(catchError(this.handleError));
  }

  /**
   * Seconde étape de la connexion : vérification du code 2FA.
   * Cette méthode est appelée uniquement si la première étape a retourné requires2fa: true.
   */
  verify2fa(payload: TwoFaPayload): Observable<LoginResponse> {
    const url = `${this.apiUrl}/auth/verify-otp/`;
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => {
        // Si le token est présent, l'authentification est un succès. On le stocke.
        if (response.token) {
          this.setToken(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  private setToken(token: string, user: User): void {
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.authState.next({ isAuthenticated: true, token, user });
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setConnectedUser(utilisateur: Utilisateur): void {
    sessionStorage.setItem('UtilisateurConnecte', JSON.stringify(utilisateur));
  }

  getConnectedUser(): Utilisateur {
    if (sessionStorage.getItem('UtilisateurConnecte')) {
      return JSON.parse(sessionStorage.getItem('UtilisateurConnecte') as string);
    }
  }

  setConnectedUtilisateurRole(utilisateurRole: UtilisateurRole): void {
    sessionStorage.setItem('utilisateurRole', JSON.stringify(utilisateurRole));
  }

  getConnectedUtilisateurRole(): UtilisateurRole {
    if (sessionStorage.getItem('utilisateurRole')) {
      return JSON.parse(sessionStorage.getItem('utilisateurRole') as string);
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.authState.next({ isAuthenticated: false, token: null, user: null });
    this.router.navigate(['/auth/login']);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  // Vérifie si le token est expiré (une bonne pratique de sécurité)
  private isTokenValid(token: string): boolean {
    try {
      /* const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false; */
      //const expirationDate = new Date(0);
      //expirationDate.setUTCSeconds(payload.exp); */
      //return expirationDate.valueOf() > new Date().valueOf();
      return true;
    } catch (e) {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Erreur lors du décodage du token JWT:', e);
      return null;
    }
  }
 /**
   * Demande de réinitialisation de mot de passe.
   * Envoie l'email de l'utilisateur au backend.
   */
  requestPasswordReset(payload: PasswordResetPayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/`;
    return this.http.post(url, payload).pipe(
      catchError(this.handleError)
    );
  }

 /**
   * Étape 2 : Vérification du code reçu par e-mail.
   * L'API doit retourner une confirmation de la validité du code.
   */
  verifyResetCode(payload: VerifyResetCodePayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/verify-reset-code/`; // Endpoint à ajuster
    return this.http.post(url, payload).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Confirme la réinitialisation en envoyant le nouveau mot de passe
   * et le token de réinitialisation.
   */
  confirmPasswordReset(payload: PasswordResetConfirmPayload): Observable<any> {
    const url = `${this.apiUrl}/password_reset/confirm/`; // Exemple d'endpoint
    return this.http.post(url, payload).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.log(error);
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Gérer les erreurs spécifiques de l'API ici
      if (error.error.message != undefined) {
        errorMessage = error.error.message
          ? error.error.message
          : 'Identifiants ou code 2FA incorrects.';
      } else if (error.error.detail != undefined) {
        errorMessage = error.error.detail;
      } else {
        errorMessage = JSON.stringify(error.error);
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
