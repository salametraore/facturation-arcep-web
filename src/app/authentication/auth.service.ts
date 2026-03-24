import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  LoginPayload,
  LoginResponse,
  TwoFaPayload,
  AuthState,
  User,
  PasswordResetPayload,
  PasswordResetConfirmPayload,
  VerifyResetCodePayload
} from './auth.models';

import { Utilisateur } from '../shared/models/utilisateur';
import { UtilisateurRole } from '../shared/models/droits-utilisateur';

import { AppConfigService } from '../core/config/app-config.service';
import { UtilisateurService } from '../shared/services/utilisateur.service';
import { UtilisateurRoleService } from '../shared/services/utilsateur-role.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'user';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly LEGACY_TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private readonly CONNECTED_USER_KEY = 'UtilisateurConnecte';
  private readonly CONNECTED_ROLE_KEY = 'utilisateurRole';
  private readonly AUTH_ERROR_KEY = 'auth_error';

  // Cohérence avec authz.service
  private readonly ACCESS_PAYLOAD_SESSION_KEY = 'rbac_access';
  private readonly OPERATIONS_SESSION_KEY = 'user_operations';

  private authState = new BehaviorSubject<AuthState>(this.getInitialState());
  public authState$ = this.authState.asObservable();

  private authErrorSubject = new BehaviorSubject<string | null>(
    sessionStorage.getItem(this.AUTH_ERROR_KEY)
  );
  public authError$ = this.authErrorSubject.asObservable();

  utilisateurConnecte!: Utilisateur;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cfg: AppConfigService,
    private utilisateurService: UtilisateurService,
    private utilisateurRoleService: UtilisateurRoleService
  ) {}

  private get apiUrl(): string {
    return this.cfg.baseUrl.replace(/\/$/, '');
  }

  private getInitialState(): AuthState {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    return {
      isAuthenticated: !!token,
      token,
      user
    };
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private setAuthError(msg: string | null): void {
    this.authErrorSubject.next(msg);

    if (msg) {
      sessionStorage.setItem(this.AUTH_ERROR_KEY, msg);
    } else {
      sessionStorage.removeItem(this.AUTH_ERROR_KEY);
    }
  }

  clearAuthError(): void {
    this.setAuthError(null);
  }

  clearSessionStorage(clearToken = false): void {
    sessionStorage.removeItem(this.CONNECTED_USER_KEY);
    sessionStorage.removeItem(this.CONNECTED_ROLE_KEY);
    sessionStorage.removeItem(this.AUTH_ERROR_KEY);

    sessionStorage.removeItem(this.ACCESS_PAYLOAD_SESSION_KEY);
    sessionStorage.removeItem(this.OPERATIONS_SESSION_KEY);

    localStorage.removeItem(this.USER_KEY);

    if (clearToken) {
      localStorage.removeItem(this.LEGACY_TOKEN_KEY);
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    this.authErrorSubject.next(null);
    this.authState.next({ isAuthenticated: false, token: null, user: null });
  }

  setToken(accessToken: string, user: User, refreshToken?: string | null): void {
    localStorage.setItem(this.LEGACY_TOKEN_KEY, accessToken);
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    this.authState.next({
      isAuthenticated: true,
      token: accessToken,
      user
    });
  }

  public getToken(): string | null {
    return this.getAccessToken();
  }

  public getAccessToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY)
    );
  }

  public hasToken(): boolean {
    return !!this.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  logout(): void {
    this.clearSessionStorage(true);
    this.router.navigate(['/auth/login']);
  }

  private isPersonnel(util: any): boolean {
    const home = String(util?.home ?? '').toUpperCase();
    if (home) {
      return home === 'BACKOFFICE';
    }

    return String(util?.nature ?? '').toUpperCase() === 'PERSONNEL';
  }

  private toUtilisateurSession(user: User): Utilisateur {
    return {
      id: Number(user?.id ?? 0),
      username: String(user?.username ?? user?.email ?? ''),
      last_name: user?.last_name,
      first_name: user?.first_name,
      telephone: user?.telephone ?? null,
      email: user?.email,
      role: undefined,
      direction: user?.direction?.id ?? null,
      password: undefined,
      nature: user?.nature
    };
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    this.setAuthError(null);

    const body: LoginPayload = {
      email: String(payload?.email ?? '').trim(),
      password: String(payload?.password ?? '')
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, body).pipe(
      catchError(this.handleError)
    );
  }

  verify2fa(payload: TwoFaPayload): Observable<LoginResponse> {
    const body: TwoFaPayload = {
      email: String(payload?.email ?? '').trim(),
      code: String(payload?.code ?? '').trim()
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verify-otp/`, body).pipe(
      catchError(this.handleError)
    );
  }

  completeAuthenticatedSession(response: LoginResponse): Observable<void> {
    const accessToken = response?.access ?? response?.token ?? null;
    const refreshToken = response?.refresh ?? null;
    const authUser = response?.user ?? null;

    if (!accessToken || !authUser) {
      return throwError(() => new Error('Réponse d’authentification invalide.'));
    }

    if (!this.isPersonnel(authUser)) {
      this.setAuthError(
        "Cette application est réservée aux utilisateurs internes. Veuillez utiliser l'application Portail Client."
      );
      this.clearSessionStorage(true);
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Accès réservé au backoffice.'));
    }

    const fallbackUser = this.toUtilisateurSession(authUser as User);

    this.setToken(accessToken, authUser as User, refreshToken);
    this.setConnectedUser(fallbackUser);
    this.setAuthError(null);

    const userId = Number((authUser as any)?.id);
    if (!userId) {
      this.utilisateurConnecte = fallbackUser;
      return of(void 0);
    }

    const user$ = this.utilisateurService.getItem(userId).pipe(
      catchError(() => of(fallbackUser))
    );

    const role$ = this.utilisateurRoleService.getListItems().pipe(
      map((items: UtilisateurRole[]) => this.findRoleForUser(items, authUser as User)),
      catchError(() => of(null))
    );

    return forkJoin({ user: user$, role: role$ }).pipe(
      tap(({ user, role }) => {
        const finalUser: Utilisateur =
          (user && this.isPersonnel(user))
            ? (user as Utilisateur)
            : fallbackUser;

        this.utilisateurConnecte = finalUser;
        this.setConnectedUser(finalUser);
        this.setConnectedUtilisateurRole(role);
        this.setAuthError(null);

        this.authState.next({
          isAuthenticated: true,
          token: accessToken,
          user: authUser as User
        });
      }),
      map(() => void 0),
      catchError((err) => {
        this.setAuthError(err?.message || 'Impossible de charger le profil utilisateur.');
        this.clearSessionStorage(true);
        this.router.navigate(['/auth/login']);
        return throwError(() =>
          err instanceof Error ? err : new Error('Impossible de charger le profil utilisateur.')
        );
      })
    );
  }

  private findRoleForUser(
    items: UtilisateurRole[] | null | undefined,
    authUser: User
  ): UtilisateurRole | null {
    const userId = Number((authUser as any)?.id ?? 0);
    const username = String((authUser as any)?.username ?? '').toLowerCase();
    const email = String((authUser as any)?.email ?? '').toLowerCase();

    const found = (items ?? []).find((it: any) => {
      const candidateId = Number(
        it?.utilisateur_id ??
          it?.utilisateur?.id ??
            it?.user_id ??
              it?.user?.id ??
                0
      );

      const candidateUsername = String(
        it?.utilisateur_username ??
          it?.utilisateur?.username ??
            it?.user?.username ??
              it?.username ??
                ''
      ).toLowerCase();

      const candidateEmail = String(
        it?.utilisateur_email ??
          it?.utilisateur?.email ??
            it?.user?.email ??
              it?.email ??
                it?.utilisateur ??
                  ''
      ).toLowerCase();

      return (
        (userId > 0 && candidateId === userId) ||
        (!!username && candidateUsername === username) ||
        (!!email && candidateEmail === email)
      );
    });

    return found ?? null;
  }

  setConnectedUser(utilisateur: Utilisateur): void {
    sessionStorage.setItem(this.CONNECTED_USER_KEY, JSON.stringify(utilisateur));
  }

  getConnectedUser(): Utilisateur | null {
    const s = sessionStorage.getItem(this.CONNECTED_USER_KEY);
    return s ? (JSON.parse(s) as Utilisateur) : null;
  }

  setConnectedUtilisateurRole(utilisateurRole: UtilisateurRole | null): void {
    if (utilisateurRole) {
      sessionStorage.setItem(this.CONNECTED_ROLE_KEY, JSON.stringify(utilisateurRole));
    } else {
      sessionStorage.removeItem(this.CONNECTED_ROLE_KEY);
    }
  }

  getConnectedUtilisateurRole(): UtilisateurRole | null {
    const s = sessionStorage.getItem(this.CONNECTED_ROLE_KEY);
    return s ? (JSON.parse(s) as UtilisateurRole) : null;
  }

  requestPasswordReset(payload: PasswordResetPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/password_reset/`, payload).pipe(
      catchError(this.handleError)
    );
  }

  verifyResetCode(payload: VerifyResetCodePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/password_reset/verify-reset-code/`, payload).pipe(
      catchError(this.handleError)
    );
  }

  confirmPasswordReset(payload: PasswordResetConfirmPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/password_reset/confirm/`, payload).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue.';

    if (error.status === 0) {
      errorMessage = 'Impossible de joindre le serveur.';
      return throwError(() => new Error(errorMessage));
    }

    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Identifiants, code OTP ou droits d’accès invalides.';
      return throwError(() => new Error(errorMessage));
    }

    if (typeof error.error?.message === 'string' && error.error.message.trim()) {
      errorMessage = error.error.message;
    } else if (typeof error.error?.detail === 'string' && error.error.detail.trim()) {
      errorMessage = error.error.detail;
    }

    return throwError(() => new Error(errorMessage));
  }
}
