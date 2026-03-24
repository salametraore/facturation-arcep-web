// src/app/authentication/can.directive.ts

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  signal
} from '@angular/core';
import { AuthzService } from './authz.service';
import { ScopedResource } from './access.models';

type AppCanMode = 'any' | 'all';
type PermissionExpr = string | string[] | null;

@Directive({
  selector: '[appCan]'
})
export class CanDirective {
  private readonly permissionExpr = signal<PermissionExpr>(null);
  private readonly mode = signal<AppCanMode>('all');
  private readonly resource = signal<ScopedResource | null>(null);
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authz: AuthzService
  ) {
    effect(() => {
      this.permissionExpr();
      this.mode();
      this.resource();
      this.authz.access();

      this.updateView();
    });
  }

  @Input()
  set appCan(value: PermissionExpr) {
    this.permissionExpr.set(value);
  }

  @Input()
  set appCanMode(value: AppCanMode | null | undefined) {
    this.mode.set(value ?? 'all');
  }

  @Input()
  set appCanResource(value: ScopedResource | null | undefined) {
    this.resource.set(value ?? null);
  }

  private updateView(): void {
    const expr = this.permissionExpr();
    const mode = this.mode();
    const resource = this.resource();

    let allowed = false;

    if (expr == null) {
      allowed = false;
    } else if (typeof expr === 'string') {
      allowed = this.authz.canOnResource(expr, resource);
    } else if (Array.isArray(expr)) {
      if (expr.length === 0) {
        allowed = true;
      } else {
        allowed =
          mode === 'any'
            ? this.authz.canAnyOnResource(expr, resource)
            : this.authz.canAllOnResource(expr, resource);
      }
    }

    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
