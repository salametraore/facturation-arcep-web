// src/app/authentication/permission.guard.ts

import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanMatchFn,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';
import { AuthzService } from './authz.service';

type RouteAccessData = {
  requiredAny?: string[] | null;
  requiredAll?: string[] | null;
};

function loginTree(router: Router, returnUrl?: string): UrlTree {
  return router.createUrlTree(
    ['/auth/login'],
    returnUrl ? { queryParams: { returnUrl } } : undefined
  );
}

function forbiddenTree(router: Router): UrlTree {
  // Remplacer '/forbidden' par votre route réelle si nécessaire
  return router.createUrlTree(['/forbidden']);
}

function evaluateRouteAccess(authz: AuthzService, data: unknown): boolean {
  const routeData = (data ?? {}) as RouteAccessData;
  return authz.canRoute(routeData.requiredAny, routeData.requiredAll);
}

export const PermissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authz = inject(AuthzService);

  if (!authService.isAuthenticated()) {
    return loginTree(router, state.url);
  }

  if (authz.access()) {
    return evaluateRouteAccess(authz, route.data)
      ? true
      : forbiddenTree(router);
  }

  return authz.ensureAccessLoaded().pipe(
    map(access => {
      if (!access) {
        return loginTree(router, state.url);
      }

      return evaluateRouteAccess(authz, route.data)
        ? true
        : forbiddenTree(router);
    }),
    catchError(() => of(loginTree(router, state.url)))
  );
};

export const PermissionMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authz = inject(AuthzService);

  const targetUrl = '/' + segments.map(s => s.path).join('/');

  if (!authService.isAuthenticated()) {
    return loginTree(router, targetUrl);
  }

  if (authz.access()) {
    return evaluateRouteAccess(authz, route.data)
      ? true
      : forbiddenTree(router);
  }

  return authz.ensureAccessLoaded().pipe(
    map(access => {
      if (!access) {
        return loginTree(router, targetUrl);
      }

      return evaluateRouteAccess(authz, route.data)
        ? true
        : forbiddenTree(router);
    }),
    catchError(() => of(loginTree(router, targetUrl)))
  );
};
