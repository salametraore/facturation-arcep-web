import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  twoFaForm: FormGroup;
  show2faForm = false;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.twoFaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  get loginF() { return this.loginForm.controls; }
  get twoFaF() { return this.twoFaForm.controls; }

  onSubmit() {
    // Exemple : ici tu ferais ton appel API
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.show2faForm = true; // simule l'étape 2FA
    }, 1000);
  }

  on2FaSubmit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      alert('Connexion réussie !');
    }, 1000);
  }
}
