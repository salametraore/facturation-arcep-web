import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { AuthzService } from '../authz.service';
import { LoginPayload, LoginResponse, TwoFaPayload } from '../auth.models';
import { AccessPayload } from '../access.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  twoFaForm!: FormGroup;

  isLoading = false;
  show2faForm = false;
  errorMessage = '';
  authErrorMsg: string | null = null;

  bgUrl = 'assets/images/background.png';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authzService: AuthzService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.twoFaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });

    this.authService.authError$.subscribe(msg => {
      this.authErrorMsg = msg;
      this.cdr.detectChanges();
    });
  }

  private finalizeSession(response: LoginResponse): Observable<AccessPayload> {
    return this.authService.completeAuthenticatedSession(response).pipe(
      switchMap((_: void): Observable<AccessPayload> => {
        return this.authzService.refreshAccess();
      })
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.authService.clearAuthError();

    const payload: LoginPayload = {
      email: String(this.loginForm.value.email ?? '').trim(),
      password: String(this.loginForm.value.password ?? '')
    };

    this.authService.login(payload).pipe(
      switchMap((response: LoginResponse) => {
        if (response?.access || response?.token) {
          return this.finalizeSession(response);
        }

        if (response?.detail) {
          this.show2faForm = true;
          this.errorMessage = 'Code de vérification envoyé à votre adresse email.';
          return EMPTY;
        }

        this.errorMessage = 'Réponse d’authentification inattendue.';
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Authentification échouée.';
        this.cdr.detectChanges();
      }
    });
  }

  on2FaSubmit(): void {
    if (this.twoFaForm.invalid) {
      this.twoFaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.authService.clearAuthError();

    const payload: TwoFaPayload = {
      email: String(this.loginForm.value.email ?? '').trim(),
      code: String(this.twoFaForm.value.code ?? '').trim()
    };

    this.authService.verify2fa(payload).pipe(
      switchMap((response: LoginResponse) => this.finalizeSession(response)),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erreur lors de la vérification 2FA.';
        this.cdr.detectChanges();
      }
    });
  }

  get loginF() {
    return this.loginForm.controls;
  }

  get twoFaF() {
    return this.twoFaForm.controls;
  }
}
