import {Component, HostListener, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthService} from "../../../authentication/auth.service";
import {User} from "../../../authentication/auth.models";
import {Utilisateur} from "../../models/utilisateur";
import {UtilisateurRole} from "../../models/droits-utilisateur";
import {filterByDirection} from "../../utils/menu-visibility.util";



export interface MenuItem {
  id: number;
  direction: number;

  titre: string;
  description?: string;

  icone?: string;

  /** Route interne (Angular routerLink) */
  url?: string;

  /**
   * Alias legacy: certaines parties de ton code utilisent "lien".
   * On le garde pour compatibilité, mais idéalement on standardise sur "url".
   */
  lien?: string;

  /**
   * Pour liens externes (optionnel).
   * Ex: https://..., mailto:, etc.
   */
  externalUrl?: string;

  /** Idéalement boolean, mais on garde ton existant */
  actif: 'OUI' | 'NON' | string;

  module: number;

  /** 1 = feuille (page), 0 = groupe (catégorie) */
  feuille: 0 | 1;

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
    {
      id: 10,
      direction: 2,
      titre: 'Paramétrage',
      description: 'Paramétrage',
      actif: 'OUI',
      module: 1,
      feuille: 0,
      sous_menus: [

         // ===================== Référentiels généraux =====================
        {
          id: 1200,
          direction: 2,
          titre: 'Référentiels généraux',
          description: 'Référentiels généraux',
          actif: 'OUI',
          module: 0,
          feuille: 0,
          url: null,
          sous_menus: [
            {
              id: 1020,
              direction: 2,
              titre: 'Les clients',
              description: 'Les clients',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/clients'
            },
            {
              id: 1020,
              direction: 2,
              titre: 'Les paramètres applicatifs',
              description: 'Les paramètres applicatifs',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/parametres-applicatifs'
            },
            {
              id: 1020,
              direction: 2,
              titre: 'Les types de directions',
              description: 'Les types de directions',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/type-directions'
            },
            {
              id: 1020,
              direction: 2,
              titre: 'Les directions',
              description: 'Les directions',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/directions'
            },
            {
              id: 1020,
              direction: 2,
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
              direction: 2,
              titre: 'Les produits',
              description: 'Les produits',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/produits'
            },
            {
              id: 1025,
              direction: 2,
              titre: 'Les zones de couverture',
              description: 'Les zones de couverture',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/zone-couverture'
            },
            {
              id: 1025,
              direction: 2,
              titre: 'Les statuts des fiches techniques',
              description: 'Les statuts des fiches techniques',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/statut-fiche-technique'
            }

          ]
        },

        // ===================== FREQUENCES =====================
        {
          id: 1100,
          direction: 2,
          titre: 'Elements liés aux Fréquences',
          description: 'Elements liés aux Fréquences',
          actif: 'OUI',
          module: 0,
          feuille: 0,
          url: null,
          sous_menus: [
            {
              id: 1005,
              direction: 2,
              titre: 'Les types de station',
              description: 'Les types de station',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/type-stations'
            },
            {
              id: 1010,
              direction: 2,
              titre: 'Les types de canaux',
              description: 'Les types de canaux',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/type-canaux'
            },
            {
              id: 1010,
              direction: 2,
              titre: 'Les types de bande de fréquence',
              description: 'Les types de bande de fréquence',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/type-bandes-frequence'
            },
            {
              id: 1010,
              direction: 2,
              titre: 'Les classes de débits',
              description: 'Les classes de débits',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/classe-debit'
            },
            {
              id: 1010,
              direction: 2,
              titre: 'Les classes de largeur de bande',
              description: 'Les classes de largeur de bande',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/classe-largeur-bande'
            },
            {
              id: 1010,
              direction: 2,
              titre: 'Les classes de puissance',
              description: 'Les classes de puissance',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/classe-puissance'
            }

          ]
        },

        // ===================== TARIFS =====================
        {
          id: 1300,
          direction: 2,
          titre: 'Tarifs',
          description: 'Paramètres liés aux tarifs',
          actif: 'OUI',
          module: 0,
          feuille: 0,
          url: null,
          sous_menus: [
            {
              id: 1030,
              direction: 2,
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
              direction: 2,
              titre: 'Les tarifs des redevances annuelles de gestion',
              description: 'Les tarifs des redevances annuelles de gestion',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/tarif-redevances-gestion'
            },
/*            {
              id: 1040,
              direction: 5555,
              titre: 'Les garanties',
              description: 'Les garanties',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/garanties'
            },*/
            {
              id: 1045,
              direction: 2,
              titre: 'Les tarifs liés aux fréquences',
              description: 'Les tarifss liés aux fréquences',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/regles-tarif-frequences'
            }
          ]
        },



        // ===================== SECURITE / UTILISATEURS =====================
        {
          id: 1500,
          direction: 2,
          titre: 'Sécurité / Utilisateurs',
          description: 'Rôles et droits',
          actif: 'OUI',
          module: 0,
          feuille: 0,
          url: null,
          sous_menus: [
            {
              id: 1050,
              direction: 2,
              titre: 'Les rôles',
              description: 'Les rôles',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/roles-page'
            },
            {
              id: 1050,
              direction: 2,
              titre: 'Les utilisateurs',
              description: 'Les utilisateurs',
              actif: 'OUI',
              module: 0,
              feuille: 1,
              sous_menus: null,
              url: 'parametre/utilisateurs'
            }
          ]
        }

      ]
    },
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
          url: 'facture/fiche-techniques-activites-postales'
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
        {
          id: 3035,
          direction: 1,
          titre: 'Génération des Redevances Annuelles',
          description: 'Génération des Redevances Annuelles',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/generation-redevances-annuelles'
        },
        {
          id: 3100,
          direction: 0,
          titre: 'Clients',
          description: 'Clients',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'facture/client-dfc'
        },
      ]
    },
    {
      id: 40, direction: 0, titre: 'Recouvrement', description: 'Recouvrement',
      actif: 'OUI', module: 1, feuille: 0,
      sous_menus: [
        {
          id: 4005,
          direction: 100,
          titre: 'Groupes recouvrement',
          description: 'Groupes recouvrement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/groupes'
        },
        {
          id: 4010,
          direction: 100,
          titre: 'Les modèles de relance',
          description: 'Les modèles de relance',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/templates'
        },
        {
          id: 4015,
          direction: 100,
          titre: 'Plans de recouvrement',
          description: 'Plans de recouvrement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/plans'
        },
        {
          id: 4020,
          direction: 100,
          titre: 'Declencheurs de recouvrement',
          description: 'Declencheurs  de recouvrement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/declencheurs'
        },
        {
          id: 4025,
          direction: 100,
          titre: 'Agenda de recouvrement',
          description: 'Agenda de recouvrement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/agenda'
        },
        {
          id: 4030,
          direction: 100,
          titre: 'Les promesses de paiement',
          description: 'Les promesses de paiement',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/promesses'
        },
        {
          id: 4075,
          direction: 0,
          titre: 'Clients',
          description: 'Clients',
          actif: 'OUI',
          module: 0,
          feuille: 1,
          sous_menus: null,
          url: 'recouvrement/clients'
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

    console.log(" main nav : roleUtilisateurConnecte");
    console.log(this.roleUtilisateurConnecte);
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
    if (!url) return;
    if (url) this.router.navigate([url]);
  }

  visibleSousMenus(item: any) {
    const dir = this.utilisateurConnecte?.direction;
    return filterByDirection(item.sous_menus || [], dir);
  }

  menuRoute(item: MenuItem): string {
    // feuille uniquement
    const route = (item.url ?? item.lien ?? '').trim();
    return route;
  }

  visibleChildren(item: MenuItem): MenuItem[] {
    // filtre "actif" + tri si tu veux
    const children = item.sous_menus ?? [];
    return children.filter(x => x.actif !== 'NON'); // adapte si tu as autre logique
  }

}
