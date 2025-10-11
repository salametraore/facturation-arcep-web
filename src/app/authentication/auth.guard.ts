// src/app/authentication/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifie si l'utilisateur est authentifié
  if (authService.isAuthenticated()) {
    return true; // Accès autorisé
  } else {
    // Si l'utilisateur n'est pas authentifié, on le redirige vers la page de connexion
    router.navigate(['/auth/login']);
    return false; // Accès refusé
  }
};
