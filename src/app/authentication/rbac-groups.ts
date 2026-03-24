// src/app/authentication/rbac-groups.ts

import { OPS, OperationCode } from './operations';

export const RBAC_GROUPS = {
  // ===========================================================================
  // PARAMETRAGE
  // ===========================================================================
  PARAM_REFERENTIELS: [
    OPS.GERER_REFERENTIELS_GENERAUX
  ] as OperationCode[],

  PARAM_FREQUENCES: [
    OPS.GERER_ELEMENTS_FREQUENCES
  ] as OperationCode[],

  PARAM_TARIFS: [
    OPS.GERER_PARAMETRES_TARIFS
  ] as OperationCode[],

  SECURITE_MENU: [
    OPS.ADMIN_GERER_ROLES,
    OPS.ADMIN_GERER_UTILISATEURS
  ] as OperationCode[],

  // ===========================================================================
  // FICHES TECHNIQUES
  // ===========================================================================
  FICHE: [
    OPS.CREER_FICHE,
    OPS.LIRE_FICHE,
    OPS.MODIFIER_FICHE,
    OPS.TRANSMETTRE_FICHE,
    OPS.REJETER_FICHE,
    OPS.AVIS_TECHNIQUE_FICHE,
    OPS.RETRAIT_FICHE
  ] as OperationCode[],

  // ===========================================================================
  // FACTURATION / DEVIS
  // ===========================================================================
  DEVIS_FACTURE: [
    OPS.GENERER_DEVIS_FACTURE,
    OPS.MODIFIER_DEVIS_FACTURE,
    OPS.EDITER_DEVIS_FACTURE,
    OPS.ANNULER_DEVIS_FACTURE
  ] as OperationCode[],

  ENCAISSEMENT: [
    OPS.ENCAISSER,
    OPS.LIRE_ENCAISSEMENT,
    OPS.EDITER_RECU_ENCAISSEMENT,
    OPS.EXPORTER_ENCAISSEMENT
  ] as OperationCode[],

  // Hypothèse métier : page exploitable soit par lecture fiche,
  // soit par les acteurs devis/facture.
  FICHES_RECUES_FACTURATION: [
    OPS.LIRE_FICHE,
    OPS.GENERER_DEVIS_FACTURE,
    OPS.MODIFIER_DEVIS_FACTURE,
    OPS.EDITER_DEVIS_FACTURE,
    OPS.ANNULER_DEVIS_FACTURE
  ] as OperationCode[],

  // ===========================================================================
  // RECOUVREMENT
  // ===========================================================================
  RECOUVREMENT: [
    OPS.RECOUVREMENT_GERER_GROUPES,
    OPS.RECOUVREMENT_GERER_MODELES_LETTRES,
    OPS.RECOUVREMENT_GERER_PLANS,
    OPS.RECOUVREMENT_GERER_DECLENCHEURS,
    OPS.RECOUVREMENT_GERER_AGENDA,
    OPS.RECOUVREMENT_GERER_PROMESSES
  ] as OperationCode[],

  // ===========================================================================
  // CLIENTS RATTACHES AUX DOMAINES METIERS
  // ===========================================================================
  CLIENTS_FICHES: [
    OPS.CREER_FICHE,
    OPS.LIRE_FICHE,
    OPS.MODIFIER_FICHE,
    OPS.TRANSMETTRE_FICHE,
    OPS.REJETER_FICHE,
    OPS.AVIS_TECHNIQUE_FICHE,
    OPS.RETRAIT_FICHE
  ] as OperationCode[],

  CLIENTS_FACTURATION: [
    OPS.GENERER_DEVIS_FACTURE,
    OPS.MODIFIER_DEVIS_FACTURE,
    OPS.EDITER_DEVIS_FACTURE,
    OPS.ANNULER_DEVIS_FACTURE,
    OPS.ENCAISSER,
    OPS.LIRE_ENCAISSEMENT,
    OPS.EDITER_RECU_ENCAISSEMENT,
    OPS.EXPORTER_ENCAISSEMENT
  ] as OperationCode[],

  CLIENTS_RECOUVREMENT: [
    OPS.RECOUVREMENT_GERER_GROUPES,
    OPS.RECOUVREMENT_GERER_MODELES_LETTRES,
    OPS.RECOUVREMENT_GERER_PLANS,
    OPS.RECOUVREMENT_GERER_DECLENCHEURS,
    OPS.RECOUVREMENT_GERER_AGENDA,
    OPS.RECOUVREMENT_GERER_PROMESSES
  ] as OperationCode[]
} as const;

export type RbacGroupName = keyof typeof RBAC_GROUPS;
