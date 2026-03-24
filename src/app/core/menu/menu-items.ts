// src/app/core/menu/menu-items.ts

import { OperationCode, OPS } from '../../authentication/operations';
import { RBAC_GROUPS } from '../../authentication/rbac-groups';

export interface MenuItem {
  id: number;
  direction: number;
  titre: string;
  description?: string;
  icone?: string | null;
  url?: string | null;
  lien?: string | null;
  externalUrl?: string | null;
  actif: 'OUI' | 'NON' | string;
  module: number;
  feuille: 0 | 1;
  sous_menus?: MenuItem[] | null;
  requiredAny?: OperationCode[];
  requiredAll?: OperationCode[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 10,
    direction: 2,
    titre: 'Paramétrage',
    description: 'Paramétrage',
    actif: 'OUI',
    module: 1,
    feuille: 0,
    requiredAny: [
      ...RBAC_GROUPS.PARAM_REFERENTIELS,
      ...RBAC_GROUPS.PARAM_FREQUENCES,
      ...RBAC_GROUPS.PARAM_TARIFS,
      ...RBAC_GROUPS.SECURITE_MENU
    ],
    sous_menus: [
      {
        id: 1200,
        direction: 2,
        titre: 'Référentiels généraux',
        description: 'Référentiels généraux',
        actif: 'OUI',
        module: 0,
        feuille: 0,
        url: null,
        requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS],
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
            url: 'parametre/clients',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1021,
            direction: 2,
            titre: 'Les paramètres applicatifs',
            description: 'Les paramètres applicatifs',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/parametres-applicatifs',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1022,
            direction: 2,
            titre: 'Les types de directions',
            description: 'Les types de directions',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/type-directions',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1023,
            direction: 2,
            titre: 'Les directions',
            description: 'Les directions',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/directions',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1024,
            direction: 2,
            titre: 'Les catégories de produits',
            description: 'Les catégories de produits',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/categorie-produits',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
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
            url: 'parametre/produits',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1026,
            direction: 2,
            titre: 'Les zones de couverture',
            description: 'Les zones de couverture',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/zone-couverture',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          },
          {
            id: 1027,
            direction: 2,
            titre: 'Les statuts des fiches techniques',
            description: 'Les statuts des fiches techniques',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/statut-fiche-technique',
            requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
          }
        ]
      },

      {
        id: 1100,
        direction: 2,
        titre: 'Elements liés aux Fréquences',
        description: 'Elements liés aux Fréquences',
        actif: 'OUI',
        module: 0,
        feuille: 0,
        url: null,
        requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES],
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
            url: 'parametre/type-stations',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
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
            url: 'parametre/type-canaux',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
          },
          {
            id: 1011,
            direction: 2,
            titre: 'Les types de bande de fréquence',
            description: 'Les types de bande de fréquence',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/type-bandes-frequence',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
          },
          {
            id: 1012,
            direction: 2,
            titre: 'Les classes de débits',
            description: 'Les classes de débits',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/classe-debit',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
          },
          {
            id: 1013,
            direction: 2,
            titre: 'Les classes de largeur de bande',
            description: 'Les classes de largeur de bande',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/classe-largeur-bande',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
          },
          {
            id: 1014,
            direction: 2,
            titre: 'Les classes de puissance',
            description: 'Les classes de puissance',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/classe-puissance',
            requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
          }
        ]
      },

      {
        id: 1300,
        direction: 2,
        titre: 'Tarifs',
        description: 'Paramètres liés aux tarifs',
        actif: 'OUI',
        module: 0,
        feuille: 0,
        url: null,
        requiredAny: [...RBAC_GROUPS.PARAM_TARIFS],
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
            url: 'parametre/tarif-frais-dossiers',
            requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
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
            url: 'parametre/tarif-redevances-gestion',
            requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
          },
          {
            id: 1045,
            direction: 2,
            titre: 'Les tarifs liés aux fréquences',
            description: 'Les tarifs liés aux fréquences',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/regles-tarif-frequences',
            requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
          }
        ]
      },

      {
        id: 1500,
        direction: 2,
        titre: 'Sécurité / Utilisateurs',
        description: 'Rôles et droits',
        actif: 'OUI',
        module: 0,
        feuille: 0,
        url: null,
        requiredAny: [...RBAC_GROUPS.SECURITE_MENU],
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
            url: 'parametre/roles-page',
            requiredAny: [OPS.ADMIN_GERER_ROLES]
          },
          {
            id: 1051,
            direction: 2,
            titre: 'Les utilisateurs internes',
            description: 'Les utilisateurs internes',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/utilisateurs',
            requiredAny: [OPS.ADMIN_GERER_UTILISATEURS]
          },
          {
            id: 1060,
            direction: 2,
            titre: 'Les utilisateurs externes',
            description: 'Les utilisateurs externes',
            actif: 'OUI',
            module: 0,
            feuille: 1,
            sous_menus: null,
            url: 'parametre/utilisateurs-externes',
            requiredAny: [OPS.ADMIN_GERER_UTILISATEURS]
          }
        ]
      }
    ]
  },

  {
    id: 20,
    direction: 0,
    titre: 'Fiches Techniques',
    description: 'Fiches Techniques',
    actif: 'OUI',
    module: 1,
    feuille: 0,
    requiredAny: [...RBAC_GROUPS.FICHE],
    sous_menus: [
      {
        id: 2010,
        direction: 2,
        titre: 'Noms de domaine',
        description: 'Noms de domaine',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'facture/domaines',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/service-confiance',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/prestations-divers',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/service-a-valeur-ajoute',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/autorisation-generale',
        requiredAny: [...RBAC_GROUPS.FICHE]
      },
      {
        id: 2040,
        direction: 3,
        titre: 'Agrement installateur',
        description: "Agrement d'installateur",
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'facture/agrement-installeur',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/autorisations-postales',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/numerotation',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/agrement-equipement',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/frequences',
        requiredAny: [...RBAC_GROUPS.FICHE]
      },
      {
        id: 2061,
        direction: 3,
        titre: 'Activites postales',
        description: 'Activites postales',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'facture/fiche-techniques-activites-postales',
        requiredAny: [...RBAC_GROUPS.FICHE]
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
        url: 'facture/client-direction-technique',
        requiredAny: [...RBAC_GROUPS.CLIENTS_FICHES]
      }
    ]
  },

  {
    id: 30,
    direction: 0,
    titre: 'Facturation/Devis',
    description: 'Facturation/Devis',
    actif: 'OUI',
    module: 1,
    feuille: 0,
    requiredAny: [
      ...RBAC_GROUPS.FICHES_RECUES_FACTURATION,
      ...RBAC_GROUPS.ENCAISSEMENT
    ],
    sous_menus: [
      {
        id: 3010,
        direction: 1,
        titre: 'Fiches techniques reçues',
        description: 'Fiches techniques reçues',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'facture/elements-recu-dsi',
        requiredAny: [...RBAC_GROUPS.FICHES_RECUES_FACTURATION]
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
        url: 'facture/gestion-devis',
        requiredAny: [...RBAC_GROUPS.DEVIS_FACTURE]
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
        url: 'facture/devis-facure',
        requiredAny: [...RBAC_GROUPS.DEVIS_FACTURE]
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
        url: 'facture/encaissement',
        requiredAny: [...RBAC_GROUPS.ENCAISSEMENT]
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
        url: 'facture/generation-redevances-annuelles',
        requiredAny: [OPS.GENERER_DEVIS_FACTURE]
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
        url: 'facture/client-dfc',
        requiredAny: [...RBAC_GROUPS.CLIENTS_FACTURATION]
      }
    ]
  },

  {
    id: 40,
    direction: 1,
    titre: 'Recouvrement',
    description: 'Recouvrement',
    actif: 'OUI',
    module: 1,
    feuille: 0,
    requiredAny: [...RBAC_GROUPS.RECOUVREMENT],
    sous_menus: [
      {
        id: 4005,
        direction: 1,
        titre: 'Groupes recouvrement',
        description: 'Groupes recouvrement',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/groupes',
        requiredAny: [OPS.RECOUVREMENT_GERER_GROUPES]
      },
      {
        id: 4010,
        direction: 1,
        titre: 'Les modèles de relance',
        description: 'Les modèles de relance',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/templates',
        requiredAny: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES]
      },
      {
        id: 4015,
        direction: 1,
        titre: 'Plans de recouvrement',
        description: 'Plans de recouvrement',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/plans',
        requiredAny: [OPS.RECOUVREMENT_GERER_PLANS]
      },
      {
        id: 4020,
        direction: 1,
        titre: 'Declencheurs de recouvrement',
        description: 'Declencheurs de recouvrement',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/declencheurs',
        requiredAny: [OPS.RECOUVREMENT_GERER_DECLENCHEURS]
      },
      {
        id: 4025,
        direction: 1,
        titre: 'Agenda de recouvrement',
        description: 'Agenda de recouvrement',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/agenda',
        requiredAny: [OPS.RECOUVREMENT_GERER_AGENDA]
      },
      {
        id: 4030,
        direction: 1,
        titre: 'Les promesses de paiement',
        description: 'Les promesses de paiement',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/promesses',
        requiredAny: [OPS.RECOUVREMENT_GERER_PROMESSES]
      },
      {
        id: 4075,
        direction: 1,
        titre: 'Clients',
        description: 'Clients',
        actif: 'OUI',
        module: 0,
        feuille: 1,
        sous_menus: null,
        url: 'recouvrement/clients',
        requiredAny: [...RBAC_GROUPS.CLIENTS_RECOUVREMENT]
      }
    ]
  }
];
