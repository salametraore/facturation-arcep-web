import {Component, HostListener, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthService} from "../../../authentication/auth.service";
import {User} from "../../../authentication/auth.models";
import {Utilisateur} from "../../models/utilisateur";
import {UtilisateurRole} from "../../models/droits-utilisateur";

interface MenuItem {
  id: number;
  direction: number;
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
  utilisateurConnecte: Utilisateur;
  roleUtilisateurConnecte: UtilisateurRole;

  user: User;

  shellBgUrl = 'assets/images/arcep-logo.png';

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private authService: AuthService) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(r => r.matches), shareReplay());
  }

  /* ---------------- MENU DATA ---------------- */
  menuItems: MenuItem[] = [
/*    {
      id: 10, direction: 100, titre: 'Paramétrage', description: 'Paramétrage',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        {
          id: 1005,
          direction: 5555,
          titre: 'Les catégories de station',
          description: 'Les catégories de station',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/categorie-stations'
        },
        {
          id: 1010,
          direction: 5555,
          titre: 'Les zones de couverture des radio',
          description: 'Les zones de couverture des radio',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/zone-couvertures'
        },
        {
          id: 1015,
          direction: 5555,
          titre: 'Les zones postales',
          description: 'Les zones postales',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/zone-postales'
        },
        {
          id: 1020,
          direction: 5555,
          titre: 'Les catégories de produits',
          description: 'Les catégories de produits',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/categorie-produits'
        },
        {
          id: 1025,
          direction: 5555,
          titre: 'Les produits',
          description: 'Les produits',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/produits'
        },
        {
          id: 1030,
          direction: 5555,
          titre: 'Les tarifs frais de dossier',
          description: 'Les tarifs frais de dossier',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/tarif-frais-dossiers'
        },
        {
          id: 1035,
          direction: 5555,
          titre: 'Les tarifs des redevances annuelles de gestion',
          description: 'Les tarifs des redevances annuelles de gestion',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/tarif-frais-redevances'
        },
        {
          id: 1040,
          direction: 5555,
          titre: 'Les garanties',
          description: 'Les garanties',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/garanties'
        },
        {
          id: 1045,
          direction: 5555,
          titre: 'Les tarifs des fréquences',
          description: 'Les tarifs des fréquences',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/tarif-frequences'
        },
        {
          id: 1050,
          direction: 5555,
          titre: 'Les rôles',
          description: 'Les rôles',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/roles-page'
        },
      ]
    },*/
    {
      id: 20, direction: 0, titre: 'Fiches Techniques', description: 'Fiches Techniques',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
/*        {
          id: 2005,
          direction: 100,
          titre: 'Tableau de bord',
          description: 'Tableau de bord',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'dashboard/dashboard-fiche-technique'
        },*/
        {
          id: 2010,
          direction: 2,
          titre: 'Noms de domaine',
          description: 'Noms de domaine',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/domaines'
        },
        {
          id: 2015,
          direction: 2,
          titre: 'Service de confiance',
          description: 'Service de confiance',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/service-confiance'
        },
        {
          id: 2020,
          direction: 1,
          titre: 'Prestations diverses',
          description: 'Prestations diverses',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/prestations-divers'
        },
        {
          id: 2025,
          direction: 5,
          titre: 'Services à valeur ajoutée',
          description: 'Services à valeur ajoutée',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/service-a-valeur-ajoute'
        },
        {
          id: 2030,
          direction: 5,
          titre: 'Autorisation générale',
          description: 'Autorisation générale',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/autorisation-generale'
        },
        {
          id: 2040,
          direction: 3,
          titre: 'Agrement installateur',
          description: 'Agrement d\'installateur',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/agrement-installeur'
        },
        {
          id: 2042,
          direction: 3,
          titre: 'Autorisations postales',
          description: 'Autorisations postales',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/autorisations-postales'
        },
        {
          id: 2045,
          direction: 3,
          titre: 'Numérotation',
          description: 'Numérotation',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/numerotation'
        },
        {
          id: 2050,
          direction: 3,
          titre: 'Agrément equipement',
          description: 'Agrément equipement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/agrement-equipement'
        },
        {
          id: 2060,
          direction: 3,
          titre: 'Fréquences',
          description: 'Fréquences',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/frequences'
        },
        {
          id: 2060,
          direction: 3,
          titre: 'Activites postales',
          description: 'Activites postales',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/activites-postales'
        },
        {
          id: 2100,
          direction: 0,
          titre: 'Clients',
          description: 'Clients',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/client-direction-technique'
        },
      ]
    },
    {
      id: 30, direction: 0, titre: 'Facturation/Devis', description: 'Facturation/Devis',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
/*        {
          id: 3005,
          direction: 100,
          titre: 'Tableau de bord',
          description: 'Tableau de bord',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'dashboard/dashboard-dfc'
        },*/
        {
          id: 3010,
          direction: 1,
          titre: 'Fiches techniques reçues',
          description: 'Fiches techniques reçues',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/elements-recu-dsi'
        },
        {
          id: 3015,
          direction: 1,
          titre: 'Devis',
          description: 'Devis',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/gestion-devis'
        },
        {
          id: 3020,
          direction: 1,
          titre: 'Factures',
          description: 'Factures',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/devis-facure'
        },
        {
          id: 3025,
          direction: 1,
          titre: 'Encaissement',
          description: 'Encaissement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/encaissement'
        },
      ]
    },
    {
      id: 40, direction: 0, titre: 'Recouvrement', description: 'Recouvrement',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
/*        {
          id: 4005,
          direction: 100,
          titre: 'Tableau de bord',
          description: 'Tableau de bord',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'dashboard/recouvrement'
        },*/
        {
          id: 4015,
          direction: 0,
          titre: 'Clients',
          description: 'Clients',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'parametre/clients'
        },
      ]
    }
  ];

  ngOnInit(): void {
    // applique les icônes de groupe et par défaut des sous-menus
    this.applyGroupAndSubIcons(this.menuItems);
    this.utilisateurConnecte = this.authService.getConnectedUser();
    this.roleUtilisateurConnecte = this.authService.getConnectedUtilisateurRole();
    console.log(" main nav : utilisateurConnecte");
    console.log(this.utilisateurConnecte);
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
  changePassword() {
    this.router.navigate(['login/change-pwd']);
  }

  connect_deconnect() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onLogin() {
    this.router.navigate(['login']);
  }

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

  visibleSousMenus(item: any) {
    const dir = this.utilisateurConnecte?.direction;
    return (item.sous_menus || []).filter(
      (sm: any) => dir === 0 || sm.direction === dir || sm.direction === 0
    );
  }


}
