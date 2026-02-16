import {AuthService} from '../auth.service';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoginPayload} from '../auth.models';
import {Router} from '@angular/router';
import {UtilisateurService} from "../../shared/services/utilisateur.service";
import {Utilisateur} from "../../shared/models/utilisateur";
import {UtilisateurRole} from "../../shared/models/droits-utilisateur";
import {UtilisateurRoleRoleService} from "../../shared/services/utilsateur-role.service";
import { forkJoin, throwError } from 'rxjs';
import { switchMap, map, take, tap, finalize, catchError } from 'rxjs/operators';

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
  utilisateur: Utilisateur;
  utilisateurs: Utilisateur[];
  utilisateurRoles: UtilisateurRole[];
  utilisateurRole: UtilisateurRole;

  bgUrl = 'assets/images/background.png';

  // [BYPASS 2FA] Code OTP par défaut utilisé pour contourner l'étape 2FA
  private readonly DEFAULT_OTP_CODE = '002025';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private utilisateurService: UtilisateurService,
    private utilisateurRoleRoleService:UtilisateurRoleRoleService,
    private router: Router
  ) {
  }

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

        const { email } = this.loginForm.value;

        if (response.detail) {
          // [BYPASS 2FA] Ancien comportement (affichage du formulaire 2FA) mis en commentaire :
          // this.show2faForm = true;
          // this.errorMessage = 'Code de vérification envoyé à votre adresse email.';

          // [BYPASS 2FA] Nouveau comportement :
          // on appelle directement la vérification 2FA avec le code par défaut 002025
          this.on2FaSubmit(this.DEFAULT_OTP_CODE);  // <== utilisation directe du code OTP par défaut
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
  // [BYPASS 2FA] Ajout d'un paramètre optionnel codeOverride pour permettre l'appel automatique
  on2FaSubmit(codeOverride?: string): void {
    // [BYPASS 2FA] Si on appelle depuis le template (sans override), on garde la validation du formulaire
    if (!codeOverride && this.twoFaForm.invalid) {
      this.twoFaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email } = this.loginForm.value;
    // [BYPASS 2FA] Utilisation du code override s'il est fourni, sinon on prend la valeur du formulaire
    const effectiveCode = codeOverride ?? this.twoFaForm.value.code;
    const payload = { email, code: effectiveCode };

    this.authService.verify2fa(payload).pipe(
      switchMap((response: any) => {
        if (!response?.token) {
          return throwError(() => new Error('Token manquant dans la réponse 2FA.'));
        }
        // Optionnel : this.authService.setToken(response.token);

        const user$ = this.utilisateurService
          .getUtilisateurByUsername(email)
          .pipe(take(1));

        const role$ = this.utilisateurRoleRoleService
          .getListItems()
          .pipe(
            take(1),
            map((items: UtilisateurRole[]) =>
                // adapte selon ta structure :
                items.find(it => it.utilisateur === email)
              // ou: items.find(it => it.utilisateur?.email === email)
            )
          );

        // Attend les deux en parallèle
        return forkJoin({ user: user$, role: role$ });
      }),
      tap(({ user, role }) => {
        this.utilisateur = user;
        this.utilisateurRole = role;

        this.authService.setConnectedUser(user);
        if (role) {
          this.authService.setConnectedUtilisateurRole(role);
        } else {
          // si tu veux bloquer sans rôle, lève une erreur ici
          // throw new Error('Aucun rôle associé à cet utilisateur.');
          this.authService.setConnectedUtilisateurRole(null as any);
        }
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
      catchError(err => {
        this.errorMessage = err?.message || 'Erreur lors de la vérification 2FA.';
        console.error(err);
        return throwError(() => err);
      })
    )
      .subscribe({
        next: () => {
          // On ne navigue qu’après récupération user + rôle
          //this.router.navigate(['/dashboard']);
          this.router.navigate(['/home']);
        },
        error: () => { /* message déjà géré dans catchError */ }
      });
  }

  // Utilitaires pour un accès facile
  get loginF() {
    return this.loginForm.controls;
  }

  get twoFaF() {
    return this.twoFaForm.controls;
  }
}
