// src/app/authentication/screen-actions.constants.ts

import { OPS, OperationCode } from './operations';

export interface ScreenActionsDef {
  read?: OperationCode[];
  create?: OperationCode[];
  edit?: OperationCode[];
  delete?: OperationCode[];
  transmit?: OperationCode[];
  reject?: OperationCode[];
  technicalOpinion?: OperationCode[];
  withdraw?: OperationCode[];
  cancel?: OperationCode[];
  print?: OperationCode[];
  export?: OperationCode[];
  record?: OperationCode[];
  unlock?: OperationCode[];
  custom?: Record<string, OperationCode[]>;
}

export const SCREEN_ACTIONS: Record<string, ScreenActionsDef> = {
  // ===========================================================================
  // FICHES TECHNIQUES
  // ===========================================================================
  'facture/domaines': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/service-confiance': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/prestations-divers': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/service-a-valeur-ajoute': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/autorisation-generale': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/agrement-installeur': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/autorisations-postales': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/numerotation': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/agrement-equipement': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/frequences': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  'facture/fiche-techniques-activites-postales': {
    read: [OPS.LIRE_FICHE],
    create: [OPS.CREER_FICHE],
    edit: [OPS.MODIFIER_FICHE],
    transmit: [OPS.TRANSMETTRE_FICHE],
    reject: [OPS.REJETER_FICHE],
    technicalOpinion: [OPS.AVIS_TECHNIQUE_FICHE],
    withdraw: [OPS.RETRAIT_FICHE]
  },

  // ===========================================================================
  // FACTURATION / DEVIS
  // ===========================================================================
  'facture/gestion-devis': {
    read: [OPS.GENERER_DEVIS_FACTURE, OPS.MODIFIER_DEVIS_FACTURE, OPS.EDITER_DEVIS_FACTURE],
    create: [OPS.GENERER_DEVIS_FACTURE],
    edit: [OPS.MODIFIER_DEVIS_FACTURE],
    print: [OPS.EDITER_DEVIS_FACTURE],
    cancel: [OPS.ANNULER_DEVIS_FACTURE]
  },

  'facture/devis-facure': {
    read: [OPS.GENERER_DEVIS_FACTURE, OPS.MODIFIER_DEVIS_FACTURE, OPS.EDITER_DEVIS_FACTURE],
    create: [OPS.GENERER_DEVIS_FACTURE],
    edit: [OPS.MODIFIER_DEVIS_FACTURE],
    print: [OPS.EDITER_DEVIS_FACTURE],
    cancel: [OPS.ANNULER_DEVIS_FACTURE]
  },

  'facture/generation-redevances-annuelles': {
    create: [OPS.GENERER_DEVIS_FACTURE],
    custom: {
      generateAnnualFees: [OPS.GENERER_DEVIS_FACTURE]
    }
  },

  // ===========================================================================
  // ENCAISSEMENT
  // ===========================================================================
  'facture/encaissement': {
    read: [OPS.LIRE_ENCAISSEMENT],
    record: [OPS.ENCAISSER],
    print: [OPS.EDITER_RECU_ENCAISSEMENT],
    export: [OPS.EXPORTER_ENCAISSEMENT]
  },

  // ===========================================================================
  // RECOUVREMENT
  // ===========================================================================
  'recouvrement/groupes': {
    read: [OPS.RECOUVREMENT_GERER_GROUPES],
    create: [OPS.RECOUVREMENT_GERER_GROUPES],
    edit: [OPS.RECOUVREMENT_GERER_GROUPES],
    delete: [OPS.RECOUVREMENT_GERER_GROUPES]
  },

  'recouvrement/templates': {
    read: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES],
    create: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES],
    edit: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES],
    delete: [OPS.RECOUVREMENT_GERER_MODELES_LETTRES]
  },

  'recouvrement/plans': {
    read: [OPS.RECOUVREMENT_GERER_PLANS],
    create: [OPS.RECOUVREMENT_GERER_PLANS],
    edit: [OPS.RECOUVREMENT_GERER_PLANS],
    delete: [OPS.RECOUVREMENT_GERER_PLANS]
  },

  'recouvrement/declencheurs': {
    read: [OPS.RECOUVREMENT_GERER_DECLENCHEURS],
    create: [OPS.RECOUVREMENT_GERER_DECLENCHEURS],
    edit: [OPS.RECOUVREMENT_GERER_DECLENCHEURS],
    delete: [OPS.RECOUVREMENT_GERER_DECLENCHEURS]
  },

  'recouvrement/promesses': {
    read: [OPS.RECOUVREMENT_GERER_PROMESSES],
    create: [OPS.RECOUVREMENT_GERER_PROMESSES],
    edit: [OPS.RECOUVREMENT_GERER_PROMESSES],
    delete: [OPS.RECOUVREMENT_GERER_PROMESSES]
  },

  'recouvrement/agenda': {
    read: [OPS.RECOUVREMENT_GERER_AGENDA],
    edit: [OPS.RECOUVREMENT_GERER_AGENDA]
  },



  // ===========================================================================
  // ADMINISTRATION
  // ===========================================================================
  'parametre/roles-page': {
    read: [OPS.ADMIN_GERER_ROLES],
    create: [OPS.ADMIN_GERER_ROLES],
    edit: [OPS.ADMIN_GERER_ROLES]
  },

  'parametre/utilisateurs': {
    read: [OPS.ADMIN_GERER_UTILISATEURS],
    create: [OPS.ADMIN_GERER_UTILISATEURS],
    edit: [OPS.ADMIN_GERER_UTILISATEURS],
    delete: [OPS.ADMIN_GERER_UTILISATEURS],
    unlock: [OPS.ADMIN_DEBLOQUER_COMPTE]
  },

  'parametre/utilisateurs-externes': {
    read: [OPS.ADMIN_GERER_UTILISATEURS],
    create: [OPS.ADMIN_GERER_UTILISATEURS],
    edit: [OPS.ADMIN_GERER_UTILISATEURS],
    delete: [OPS.ADMIN_GERER_UTILISATEURS],
    unlock: [OPS.ADMIN_DEBLOQUER_COMPTE]
  }
};
