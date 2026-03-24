import { OPS, OperationCode } from './operations';
import { RBAC_GROUPS } from './rbac-groups';

export interface RouteAccessDef {
  requiredAny?: OperationCode[];
  requiredAll?: OperationCode[];
}

export const ROUTE_ACCESS: Record<string, RouteAccessDef> = {
  // ===========================================================================
  // PARAMETRAGE
  // ===========================================================================
  'parametre/clients': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/clients/new': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/clients/:id': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/parametres-applicatifs': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/type-directions': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/directions': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/categorie-produits': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/produits': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/zone-couverture': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },
  'parametre/statut-fiche-technique': {
    requiredAny: [...RBAC_GROUPS.PARAM_REFERENTIELS]
  },

  'parametre/type-stations': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },
  'parametre/type-canaux': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },
  'parametre/type-bandes-frequence': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },
  'parametre/classe-debit': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },
  'parametre/classe-largeur-bande': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },
  'parametre/classe-puissance': {
    requiredAny: [...RBAC_GROUPS.PARAM_FREQUENCES]
  },

  'parametre/tarif-frais-dossiers': {
    requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
  },
  'parametre/tarif-redevances-gestion': {
    requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
  },
  'parametre/regles-tarif-frequences': {
    requiredAny: [...RBAC_GROUPS.PARAM_TARIFS]
  },

  'parametre/roles-page': {
    requiredAny: [OPS.ADMIN_GERER_ROLES]
  },
  'parametre/utilisateurs': {
    requiredAny: [OPS.ADMIN_GERER_UTILISATEURS]
  },
  'parametre/utilisateurs-externes': {
    requiredAny: [OPS.ADMIN_GERER_UTILISATEURS]
  },

  // ===========================================================================
  // FICHES TECHNIQUES
  // ===========================================================================
  'facture/domaines': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/service-confiance': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/prestations-divers': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/service-a-valeur-ajoute': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/autorisation-generale': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/agrement-installeur': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/autorisations-postales': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/numerotation': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/agrement-equipement': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/frequences': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/fiche-techniques-activites-postales': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/client-direction-technique': {
    requiredAny: [...RBAC_GROUPS.CLIENTS_FICHES]
  },
  'facture/client-direction-technique-detail/:id': {
    requiredAny: [...RBAC_GROUPS.CLIENTS_FICHES]
  },

  // ===========================================================================
  // FACTURATION / DEVIS
  // ===========================================================================
  'facture/elements-recu-dsi': {
    requiredAny: [...RBAC_GROUPS.FICHES_RECUES_FACTURATION]
  },
  'facture/gestion-devis': {
    requiredAny: [...RBAC_GROUPS.DEVIS_FACTURE]
  },
  'facture/devis-facure': {
    requiredAny: [...RBAC_GROUPS.DEVIS_FACTURE]
  },
  'facture/encaissement': {
    requiredAny: [...RBAC_GROUPS.ENCAISSEMENT]
  },
  'facture/generation-redevances-annuelles': {
    requiredAny: [OPS.GENERER_DEVIS_FACTURE]
  },
  'facture/client-dfc': {
    requiredAny: [...RBAC_GROUPS.CLIENTS_FACTURATION]
  },
  'facture/client-dfc-detail/:id': {
    requiredAny: [...RBAC_GROUPS.CLIENTS_FACTURATION]
  },

  // ===========================================================================
  // ACTIVITES POSTALES
  // ===========================================================================
  'facture/activites-postales': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/activites-postales/:id/comptes': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/activites-postales/:id/traitement': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },
  'facture/activites-postales/:id/recap': {
    requiredAny: [...RBAC_GROUPS.FICHE]
  },

  // ===========================================================================
  // RECOUVREMENT
  // ===========================================================================
  'recouvrement/dashboard': {
    requiredAny: [...RBAC_GROUPS.RECOUVREMENT]
  },
  'recouvrement/groupes': {
    requiredAny: [OPS.RECOUVREMENT_GERER_GROUPES]
  },
  'recouvrement/templates': {
    requiredAny: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES]
  },
  'recouvrement/plans': {
    requiredAny: [OPS.RECOUVREMENT_GERER_PLANS]
  },
  'recouvrement/declencheurs': {
    requiredAny: [OPS.RECOUVREMENT_GERER_DECLENCHEURS]
  },
  'recouvrement/agenda': {
    requiredAny: [OPS.RECOUVREMENT_GERER_AGENDA]
  },
  'recouvrement/promesses': {
    requiredAny: [OPS.RECOUVREMENT_GERER_PROMESSES]
  },
  'recouvrement/clients': {
    requiredAny: [...RBAC_GROUPS.CLIENTS_RECOUVREMENT]
  }
};
