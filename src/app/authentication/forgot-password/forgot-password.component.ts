import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { PasswordResetConfirmPayload, PasswordResetPayload, VerifyResetCodePayload } from '../auth.models';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
   verifyCodeForm!: FormGroup;
    resetPasswordForm!: FormGroup;
  isFormSubmitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  currentStep: number = 1; // 1: Demande, 2: Vérification, 3: Nouveau mot de passe

  emailToReset: string="";


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.verifyCodeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
        // Validateur pour s'assurer que les deux mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')!.value === form.get('confirmPassword')!.value ? null : { mismatch: true };
  }

/*
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { email } = this.forgotPasswordForm.value;

    this.authService.requestPasswordReset({ email }).subscribe({
      next: (res) => {
        console.log(res);
        if (res.hasOwnProperty('status') && res.status == 'OK') {
          this.isLoading = false;
          this.isFormSubmitted = true;
          this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.';
          this.errorMessage = '';
        } else {
           this.successMessage = '';
          this.errorMessage = 'Échec de la demande. Veuillez vérifier votre adresse e-mail.';
        }
        this.cdr.detectChanges();
        // Optionnel: réinitialiser le formulaire
        // this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.message || 'Échec de la demande. Veuillez vérifier votre adresse e-mail.';
        this.cdr.detectChanges();
      },
    });
  } */

     // Étape 1 : Demande de réinitialisation
  onRequestPasswordReset(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.emailToReset = this.forgotPasswordForm.value.email;
    const payload: PasswordResetPayload = { email: this.emailToReset };
    this.authService.requestPasswordReset(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 2; // Passe à l'étape 2
        this.successMessage = 'Un code de vérification a été envoyé à votre adresse e-mail.';
        this.errorMessage = '';
          this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Échec de la demande. Veuillez vérifier votre adresse e-mail.';
  this.cdr.detectChanges();
      }
    });
  }

  // Étape 2 : Vérification du code
  onVerifyCode(): void {
    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { code } = this.verifyCodeForm.value;
    const payload: VerifyResetCodePayload = { email: this.emailToReset, token:code };
    console.log(payload) ;
    this.authService.verifyResetCode(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 3; // Passe à l'étape 3
        this.successMessage = 'Code vérifié. Vous pouvez maintenant définir un nouveau mot de passe.';
        this.errorMessage = '';
         this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Code de vérification invalide. Veuillez réessayer.';
        this.cdr.detectChanges();
      }
    });
  }

  // Étape 3 : Soumission du nouveau mot de passe
  onResetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { newPassword } = this.resetPasswordForm.value;
    const { code } = this.verifyCodeForm.value;
    const payload: PasswordResetConfirmPayload = {
      email: this.emailToReset,
      token: code,
      password: newPassword
    };

    this.authService.confirmPasswordReset(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès.';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/auth/login']); // Redirection vers la page de connexion
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Échec de la réinitialisation. Veuillez réessayer.';
        this.cdr.detectChanges();
      }
    });
  }
}
