import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { LoginPayload } from '../auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  twoFaForm!: FormGroup;
  show2faForm = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: LoginPayload = this.loginForm.value;

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.detail) {
          this.show2faForm = true;
          this.errorMessage = 'Code de vérification envoyé à votre adresse email.';
        } else if (response.token) {
          this.router.navigate(['/dashboard']);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message;
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

    const { email } = this.loginForm.value;
    const { code } = this.twoFaForm.value;

    this.authService.verify2fa({ email, code }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          this.router.navigate(['/dashboard']);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message;
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
