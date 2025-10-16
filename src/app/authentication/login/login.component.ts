import { AuthService } from '../auth.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { LoginPayload } from '../auth.models';
import { Router } from '@angular/router';
import {UtilisateurService} from "../../shared/services/utilisateur.service";
import {Client} from "../../shared/models/client";
import {Utilisateur} from "../../shared/models/utilisateur";
import {UtilisateurRole} from "../../shared/models/droits-utilisateur";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  // A utiliser pour afficher un spinner ou désactiver le bouton de soumission
  isLoading: boolean = false;
  twoFaForm!: FormGroup; // Nouveau FormGroup pour le code 2FA
  show2faForm: boolean = false; // Variable pour contrôler l'affichage

  errorMessage: string = ''; // Pour afficher les erreurs de l'API
  utilisateur:Utilisateur;
  utilisateurs:Utilisateur[];
  utilisateurRole:UtilisateurRole;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private utilisateurService:UtilisateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.twoFaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // Valide un code de 6 chiffres
    });
  }

  // La méthode de soumission du formulaire
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
          // Cas où l'authentification est réussie sans 2FA
          this.router.navigate(['/']); // Redirection vers la page d'accueil
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      },
    });
    this.cdr.detectChanges();
  }

  // Nouvelle méthode pour soumettre le code 2FA
  on2FaSubmit(): void {
    if (this.twoFaForm.invalid) {
      this.twoFaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { code } = this.twoFaForm.value;
    const { email } = this.loginForm.value;
    const payload = { email: email, code: code };

    // TODO: Appeler le service pour valider le code 2FA
    this.authService.verify2fa(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          // this.authService.setToken(response.token);

          this.utilisateurService.getItem(1).subscribe((ligneUtilisateur: Utilisateur) => {
            this.utilisateur = ligneUtilisateur;
            this.authService.setConnectedUser(ligneUtilisateur);
          });

          this.utilisateurService.getUtilisateurRoles(1).subscribe((ligneUtilisateurRole: UtilisateurRole) => {
            this.utilisateurRole = ligneUtilisateurRole;
            console.log
            this.authService.setConnectedUtilisateurRole(ligneUtilisateurRole);
          });

          this.router.navigate(['/dashboard']); // Redirection vers la page d'accueil
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      },
    });
    // On simule l'appel API
    //  setTimeout(() => {
    //   this.isLoading = false;
    //   const apiResponse = { success: true, token: 'fake-jwt-token-from-api' };
    //
    //   if (apiResponse.success) {
    //     // Authentification réussie, on gère le token
    //     this.authService.setToken(apiResponse.token);
    //     console.log('Authentification réussie ! Token reçu :', apiResponse.token);
    //     // Redirection vers la page d'accueil
    //   } else {
    //     this.errorMessage = 'Code incorrect. Veuillez réessayer.';
    //   }
    // }, 1000);

  }

  // Utilitaires pour un accès facile
  get loginF() {
    return this.loginForm.controls;
  }
  get twoFaF() {
    return this.twoFaForm.controls;
  }
}
