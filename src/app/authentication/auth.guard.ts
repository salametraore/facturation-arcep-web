// src/app/authentication/auth.guard.ts

import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  // ⚠️ Désactivation temporaire de l'authentification
  // Retourne toujours "true" pour permettre l'accès à toutes les pages
  return true;
};
