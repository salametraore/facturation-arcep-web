import { Component, HostListener, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import {AuthService} from "../../../authentication/auth.service";
import {User} from "../../../authentication/auth.models";

interface MenuItem {
  id: number;
  titre: string;
  description: string;
  icone?: string;
  lien?: string;
  url?: string;
  actif: string;
  module: number;
  feuille: number;
  sous_menus?: MenuItem[] | null;
}

/* ====== MAPPINGS ICÔNES ====== */
// icône "groupe" par module (id)
const GROUP_ICON_BY_ID: Record<number, string> = {
  10: 'settings',        // Paramétrage
  20: 'description',     // Fiches Techniques
  30: 'receipt_long',    // Facturation/Devis
  40: 'payments',        // Recouvrement
};
// icône par défaut des SOUS-MENUS selon le module (id du groupe parent)
const SUB_ICON_BY_GROUP_ID: Record<number, string> = {
  10: 'tune',                 // Paramétrage → réglages fins
  20: 'article',              // Fiches techniques → doc
  30: 'request_quote',        // Facturation/Devis → facture/devis
  40: 'account_balance_wallet'// Recouvrement → portefeuille
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

  user:User;

  constructor(private breakpointObserver: BreakpointObserver, private router: Router,private authService:AuthService) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(r => r.matches), shareReplay());
  }

  /* ---------------- MENU DATA ---------------- */
  menuItems: MenuItem[] = [
    {
      id: 10, titre: 'Paramétrage', description: 'Paramétrage',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        { id: 1005, titre: 'Les catégories de station', description: 'Les catégories de station', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/categorie-stations' },
        { id: 1010, titre: 'Les zones de couverture des radio', description: 'Les zones de couverture des radio', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/zone-couvertures' },
        { id: 1015, titre: 'Les zones postales', description: 'Les zones postales', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/zone-postales' },
        { id: 1020, titre: 'Les catégories de produits', description: 'Les catégories de produits', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/categorie-produits' },
        { id: 1025, titre: 'Les produits', description: 'Les produits', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/produits' },
        { id: 1030, titre: 'Les tarifs frais de dossier', description: 'Les tarifs frais de dossier', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/tarif-frais-dossiers' },
        { id: 1035, titre: 'Les tarifs des redevances annuelles de gestion', description: 'Les tarifs des redevances annuelles de gestion', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/tarif-frais-redevances' },
        { id: 1040, titre: 'Les garanties', description: 'Les garanties', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/garanties' },
        { id: 1045, titre: 'Les tarifs des fréquences', description: 'Les tarifs des fréquences', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/tarif-frequences' },
      ]
    },
    {
      id: 20, titre: 'Fiches Techniques', description: 'Fiches Techniques',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        { id: 2005, titre: 'Tableau de bord', description: 'Tableau de bord', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'dashboard/dashboard-fiche-technique' },
        { id: 2010, titre: 'Noms de domaine', description: 'Noms de domaine', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/domaines' },
        { id: 2015, titre: 'Service de confiance', description: 'Service de confiance', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/service-confiance' },
      ]
    },
    {
      id: 30, titre: 'Facturation/Devis', description: 'Facturation/Devis',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        { id: 3005, titre: 'Tableau de bord', description: 'Tableau de bord', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'dashboard/dashboard-dfc' },
        { id: 3010, titre: 'Fiches techniques reçues', description: 'Fiches techniques reçues', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'facture/elements-recu-dsi' },
        { id: 3015, titre: 'Factures/Devis', description: 'Factures/Devis', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'facture/devis-facure' },
      ]
    },
    {
      id: 40, titre: 'Recouvrement', description: 'Recouvrement',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        { id: 4005, titre: 'Tableau de bord', description: 'Tableau de bord', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'dashboard/recouvrement' },
        { id: 4010, titre: 'Encaissement', description: 'Encaissement', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'facture/encaissement' },
        { id: 4015, titre: 'Clients', description: 'Clients', actif: 'OUI', module: 0, feuille: 1, sous_menus: null, url: 'parametre/clients' },
      ]
    }
  ];

  ngOnInit(): void {
    // applique les icônes de groupe et par défaut des sous-menus
    this.applyGroupAndSubIcons(this.menuItems);
    this.user = this.authService.getConnectedUser();
  }

  /* ------- mapping d'icônes (méthode de classe, PAS de "function") ------- */
  private applyGroupAndSubIcons(items: MenuItem[]): void {
    for (const group of items) {
      // icône du groupe
      if (!group.icone) {
        group.icone = GROUP_ICON_BY_ID[group.id] ?? 'folder';
      }
      // icône par défaut des sous-menus pour ce groupe
      const subDefault = SUB_ICON_BY_GROUP_ID[group.id] ?? 'article';
      if (group.sous_menus?.length) {
        for (const sm of group.sous_menus) {
          if (!sm.icone) sm.icone = subDefault;
        }
      }
    }
  }

  /* ---------------- NAV & DIVERS (tes méthodes) ---------------- */
  changePassword() { this.router.navigate(['login/change-pwd']); }

  connect_deconnect() { this.router.navigate(['login']); }

  onLogin() { this.router.navigate(['login']); }

  enterFullScreen(): void {
    const elem: any = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    this.isFullScreen = true;
  }

  exitFullScreen(): void {
    const doc: any = document;
    if (doc.exitFullscreen) doc.exitFullscreen();
    this.isFullScreen = false;
  }

  onGoHome() {
    this.router.navigate(['home']);
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    this.isFloating = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    if (!this.isMenuVisible && (event.clientX > screenWidth - 50 && event.clientY < 50)) {
      this.isFloating = true;
    } else {
      this.isFloating = false;
    }
  }

  onNavigate(url: string) {
    if (url) this.router.navigate([url]);
  }
}
