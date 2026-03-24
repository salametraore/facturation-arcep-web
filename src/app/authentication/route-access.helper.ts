// src/app/authentication/route-access.helper.ts

import { Route } from '@angular/router';
import { ROUTE_ACCESS } from './route-access.constants';
import { AuthGuard } from './auth.guard';
import { PermissionGuard, PermissionMatchGuard } from './permission.guard';

export function withAccess(path: string, route: Route): Route {
  const access = ROUTE_ACCESS[path] ?? {};

  return {
    ...route,
    canActivate: [...(route.canActivate ?? []), AuthGuard, PermissionGuard],
    canMatch: [...(route.canMatch ?? []), PermissionMatchGuard],
    data: {
      ...(route.data ?? {}),
      ...access
    }
  };
}
