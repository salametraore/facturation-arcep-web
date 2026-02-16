import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../authentication/auth.service';
import { MENU_ITEMS, MenuItem } from '../../shared/menu/menu-items';
import {DirectionService} from "../../shared/services/direction.service";
import {Direction} from "../../shared/models/direction";


type QuickLink = { label: string; route: string; icon?: string };

type ModuleTile = {
  id: number;
  title: string;
  description: string;
  icon: string;
  links: QuickLink[]; // liens visibles (filtrés)
};

type WorkflowStep = {
  title: string;
  actor: string;
  bullets: string[];
  // optionnel : si tu veux des raccourcis (tu peux laisser vide)
  route?: string;
  routeLabel?: string;
};

type Workflow = {
  title: string;
  description: string;
  icon: string;
  steps: WorkflowStep[];
};


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  fullName = 'Utilisateur';
  directionLabel = '—';

  tiles: ModuleTile[] = [];

  direction: Direction;

  workflows: Workflow[] = [
    {
      title: 'Workflow : Fiche technique et facturation associée',
      description: 'Du dépôt de la fiche jusqu’au paiement de la redevance de première année.',
      icon: 'schema',
      steps: [
        {
          title: 'Création de la fiche technique',
          actor: 'Agent technique',
          bullets: [
            'Saisie des informations générales (client, service demandé, références…)',
            'Saisie des caractéristiques techniques du/des services sollicités',
            'Enregistrement puis soumission pour validation',
          ],
        },
        {
          title: 'Contrôle / validation et transmission',
          actor: 'Superviseur technique',
          bullets: [
            'Vérification de la complétude et de la cohérence des informations saisies',
            'Corrections éventuelles (retour à l’agent technique si besoin)',
            'Validation puis transmission de la fiche à la DFC pour facturation',
          ],
        },
        {
          title: 'Émission du devis des frais de dossier',
          actor: 'Agent DFC',
          bullets: [
            'Génération du devis des frais de dossier lié à la fiche technique',
            'Mise à disposition pour paiement',
          ],
        },
        {
          title: 'Encaissement des frais de dossier',
          actor: 'Caissier DFC',
          bullets: [
            'Encaissement du devis (paiement)',
            'Enregistrement du règlement et confirmation du paiement',
          ],
        },
        {
          title: 'Étude technique et saisie de l’avis',
          actor: 'Superviseur technique',
          bullets: [
            'Réalisation de l’étude technique sur la base de la fiche',
            'Saisie de l’avis d’étude technique (favorable / défavorable / réservé + observations)',
            'Mise à jour du statut de la fiche en conséquence',
          ],
        },
        {
          title: 'Émission du devis de la redevance de première année',
          actor: 'Agent DFC',
          bullets: [
            'Si l’avis est favorable (ou conforme aux règles de passage), génération du devis de la redevance de première année',
            'Mise à disposition pour paiement',
          ],
        },
        {
          title: 'Encaissement de la redevance de première année',
          actor: 'Caissier DFC',
          bullets: [
            'Encaissement du devis de redevance',
            'Enregistrement du règlement et confirmation du paiement',
          ],
        },
      ],
    },

    {
      title: 'Variantes de facturation : redevances annuelles',
      description: 'Génération annuelle (individuelle ou en lot) et redevances indexées au chiffre d’affaires.',
      icon: 'event_repeat',
      steps: [
        {
          title: 'Clients déjà bénéficiaires de services',
          actor: 'Agent DFC',
          bullets: [
            'Une interface dédiée permet la génération des redevances annuelles :',
            '— Individuellement (par client / service)',
            '— Ou en lot (génération groupée) par année',
          ],
        },
        {
          title: 'Redevances indexées au chiffre d’affaires (postales, télécoms, etc.)',
          actor: 'Agent DFC',
          bullets: [
            'Prérequis : importer ou saisir les lignes de chiffre d’affaires de l’année concernée',
            'Ensuite seulement : génération des factures de redevances annuelles correspondantes',
          ],
        },
      ],
    },

    {
      title: 'Recouvrement',
      description: 'Traitement des factures non réglées : relances, pénalités, échéanciers, actions…',
      icon: 'account_balance_wallet',
      steps: [
        {
          title: 'Déclenchement du recouvrement',
          actor: 'Recouvrement',
          bullets: [
            'Après émission (et/ou validation) des factures, celles qui ne sont pas réglées suivent le processus de recouvrement',
            'Relances, pénalités, échéanciers, actions, etc. selon les règles en vigueur',
          ],
        },
      ],
    },
  ];

  constructor(private authService: AuthService,
              private directionService: DirectionService) {}

  ngOnInit(): void {
    const u = this.authService.getConnectedUser();

    // si direction vient en string => convertit
    const dir = u?.direction != null ? Number(u.direction) : null;

    this.fullName = u?.username ? `Bienvenue ${u.username}` : this.fullName;
    this.directionLabel = dir != null ? `Direction #${dir}` : '—';

    this.buildTiles(dir);

    // DEBUG (à enlever après)
    console.log('[HOME] dir =', dir);
    console.log('[HOME] tiles =', this.tiles);
  }

  private isActive(item: MenuItem): boolean {
    return (item.actif ?? 'OUI') === 'OUI';
  }

  /** EXACTEMENT ta règle du menu latéral */
  private isVisibleByDirection(item: MenuItem, dir: number | null): boolean {
    return dir === 0 || item.direction === dir || item.direction === 0;
  }

  private getInternalLink(item: MenuItem): string | null {
    const raw = item.url ?? item.lien;
    return (typeof raw === 'string' && raw.trim().length > 0) ? raw.trim() : null;
  }

  private normalizeRoute(url: string): string {
    return url.startsWith('/') ? url : `/${url}`;
  }

  private tileIconById(id: number): string {
    switch (id) {
      case 10: return 'settings';
      case 20: return 'description';
      case 30: return 'receipt_long';
      case 40: return 'account_balance_wallet';
      default: return 'apps';
    }
  }

  private collectLeafLinks(item: MenuItem, dir: number | null): QuickLink[] {
    if (!this.isActive(item)) return [];
    if (!this.isVisibleByDirection(item, dir)) return [];

    const children = item.sous_menus ?? [];
    if (children.length > 0) {
      return children.flatMap(ch => this.collectLeafLinks(ch, dir));
    }

    const link = this.getInternalLink(item);
    if (item.feuille === 1 && link) {
      return [{
        label: item.titre,
        route: this.normalizeRoute(link),
        icon: (item.icone ?? undefined) || 'chevron_right'
      }];
    }
    return [];
  }

  private buildTiles(dir: number | null): void {
    const roots = MENU_ITEMS.filter(mi => [10, 20, 30, 40].includes(mi.id));

    // IMPORTANT: même si roots vide, tu peux forcer 4 tuiles de base
    this.tiles = roots.map(root => {
      const links = this.collectLeafLinks(root, dir);
      return {
        id: root.id,
        title: root.titre,
        description: root.description || root.titre,
        icon: this.tileIconById(root.id),
        links: links, // tu peux faire .slice(0,6) si tu veux
      };
    });
  }

  tileEnabled(t: ModuleTile): boolean {
    return t.links.length > 0;
  }

  tilePrimaryRoute(t: ModuleTile): string | null {
    return t.links[0]?.route || null;
  }

  trackById(_: number, t: ModuleTile): number {
    return t.id;
  }
}
