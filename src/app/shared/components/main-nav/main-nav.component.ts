import { Component, HostListener, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from '../../../authentication/auth.service';
import { AuthzService } from '../../../authentication/authz.service';
import { User } from '../../../authentication/auth.models';
import { Utilisateur } from '../../models/utilisateur';
import { UtilisateurRole } from '../../models/droits-utilisateur';
import { filterByDirection } from '../../utils/menu-visibility.util';

import { MENU_ITEMS, MenuItem } from '../../../core/menu/menu-items';

/* ====== MAPPINGS ICÔNES ====== */
const GROUP_ICON_BY_ID: Record<number, string> = {
  10: 'settings',
  20: 'description',
  30: 'receipt_long',
  40: 'payments',
};

const SUB_ICON_BY_GROUP_ID: Record<number, string> = {
  10: 'tune',
  20: 'article',
  30: 'request_quote',
  40: 'account_balance_wallet'
};

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  isFullScreen = false;
  isHandset$: Observable<boolean>;
  isMenuVisible = false;
  isFloating = false;

  utilisateurConnecte!: Utilisateur | null;
  roleUtilisateurConnecte!: UtilisateurRole | null;
  user!: User | null;

  shellBgUrl = 'assets/images/arcep-logo.png';

  /**
   * Menu final affiché après :
   * 1) import depuis core/menu/menu-items.ts
   * 2) ajout des icônes
   * 3) filtrage RBAC
   */
  menuItems: MenuItem[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authService: AuthService,
    private authzService: AuthzService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(r => r.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    this.utilisateurConnecte = this.authService.getConnectedUser();
    this.roleUtilisateurConnecte = this.authService.getConnectedUtilisateurRole();

    // Clone pour éviter de modifier la constante MENU_ITEMS
    const clonedMenu = this.deepCloneMenu(MENU_ITEMS);

    // Applique les icônes récursivement
    this.applyIconsRecursively(clonedMenu);

    // Filtre RBAC
    const rbacFilteredMenu = this.authzService.filterMenu(clonedMenu);

    // Le filtrage par direction est ensuite appliqué dans le template
    this.menuItems = rbacFilteredMenu;
  }

  private deepCloneMenu(items: MenuItem[]): MenuItem[] {
    return items.map(item => ({
      ...item,
      sous_menus: item.sous_menus ? this.deepCloneMenu(item.sous_menus) : null
    }));
  }

  private applyIconsRecursively(items: MenuItem[], parentGroupId?: number): void {
    for (const item of items) {
      const isGroup = !!item.sous_menus?.length;

      if (!item.icone) {
        if (isGroup) {
          item.icone = GROUP_ICON_BY_ID[item.id] ?? GROUP_ICON_BY_ID[parentGroupId ?? -1] ?? 'folder';
        } else {
          item.icone = SUB_ICON_BY_GROUP_ID[parentGroupId ?? -1] ?? 'article';
        }
      }

      if (item.sous_menus?.length) {
        this.applyIconsRecursively(item.sous_menus, item.id);
      }
    }
  }

  changePassword(): void {
    this.router.navigate(['login/change-pwd']);
  }

  connect_deconnect(): void {
    this.authService.logout();
    this.authzService.clear();
    this.router.navigate(['/auth/login']);
  }

  onLogin(): void {
    this.router.navigate(['login']);
  }

  enterFullScreen(): void {
    const elem: any = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    this.isFullScreen = true;
  }

  exitFullScreen(): void {
    const doc: any = document;
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    }
    this.isFullScreen = false;
  }

  onGoHome(): void {
    this.router.navigate(['home']);
  }

  toggleMenu(): void {
    this.isMenuVisible = !this.isMenuVisible;
    this.isFloating = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const screenWidth = window.innerWidth;

    if (!this.isMenuVisible && event.clientX > screenWidth - 50 && event.clientY < 50) {
      this.isFloating = true;
    } else {
      this.isFloating = false;
    }
  }

  onNavigate(url: string): void {
    if (!url?.trim()) {
      return;
    }

    this.router.navigate([url]);
  }

  visibleSousMenus(item: MenuItem): MenuItem[] {
    const dir = this.utilisateurConnecte?.direction;
    return filterByDirection(item.sous_menus || [], dir).filter(x => x.actif !== 'NON');
  }

  menuRoute(item: MenuItem): string {
    return (item.url ?? item.lien ?? '').trim();
  }

  visibleChildren(item: MenuItem): MenuItem[] {
    return (item.sous_menus ?? []).filter(x => x.actif !== 'NON');
  }

  trackByMenuId(_index: number, item: MenuItem): number {
    return item.id;
  }
}
