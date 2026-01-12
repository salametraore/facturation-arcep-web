// src/app/facture/frequences/forms/frequences.form.ts

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CategoryId } from '../../../shared/models/frequences-category.types';
import { CATEGORY_CONFIG, requiredIf } from '../config/frequences-category.config';

import {
  FicheTechniqueCanalRequest,
  FicheTechniqueStationRequest,
  FicheTechniqueFrequenceCreateRequest
} from '../../../shared/models/fiche-technique-frequence-create-request';


// ===============================================================
// 1. FORMULAIRE PRINCIPAL (FicheTechniqueFrequenceCreateRequest)
// ---------------------------------------------------------------
export function buildFicheTechniqueFrequenceForm(
  fb: FormBuilder,
  fiche?: Partial<FicheTechniqueFrequenceCreateRequest>
): FormGroup {

  const category: CategoryId = (fiche?.categorie_produit as CategoryId);

  return fb.group({
    fiche: fb.group({
      client:            new FormControl(fiche?.client ?? null, [Validators.required]),
      categorie_produit: new FormControl(fiche?.categorie_produit ?? category, [Validators.required]),

      objet:             new FormControl((fiche as any)?.objet ?? null),
      commentaire:       new FormControl(fiche?.commentaire ?? null),

      direction:          new FormControl(fiche?.direction ?? null),
      utilisateur:        new FormControl(fiche?.utilisateur ?? null),
      date_creation:      new FormControl(fiche?.date_creation ?? null),

      position:           new FormControl(fiche?.position ?? null),
      position_direction: new FormControl(fiche?.position_direction ?? null),

      avis:               new FormControl(fiche?.avis ?? null),
      date_avis:          new FormControl(fiche?.date_avis ?? null),

      duree:              new FormControl(fiche?.duree ?? null),
      date_debut:         new FormControl(fiche?.date_debut ?? null),
      date_fin:           new FormControl(fiche?.date_fin ?? null),

      periode:            new FormControl(fiche?.periode ?? null),
    }),

    stations: fb.array([]),
    canaux:   fb.array([]),
  });
}


// ===============================================================
// 2. STATION (FicheTechniqueStationRequest)
// - champs classe_* gardés dans le FormGroup (cachés dans l’UI)
// - created_at / updated_at / updated_by ABSENTS du FormGroup
// ---------------------------------------------------------------
export function buildStationFG(
  fb: FormBuilder,
  s: Partial<FicheTechniqueStationRequest> = {},
  cat: CategoryId
): FormGroup {

  const cfg = CATEGORY_CONFIG[cat].stations;

  return fb.group({
    categorie_produit: new FormControl(s.categorie_produit ?? cat),

    type_station: new FormControl(s.type_station ?? null, requiredIf(cfg.type_station)),

    // valeur saisie (visible)
    puissance: new FormControl(s.puissance ?? null, requiredIf(cfg.puissance)),
    // classe calculée (cachée)
    classe_puissance: new FormControl(s.classe_puissance ?? null),

    nombre_station: new FormControl(s.nombre_station ?? null, requiredIf(cfg.nombre_station)),

    debit_kbps:   new FormControl(s.debit_kbps ?? null, requiredIf(cfg.debit_kbps)),
    classe_debit: new FormControl(s.classe_debit ?? null), // caché

    largeur_bande_mhz: new FormControl(s.largeur_bande_mhz ?? null, requiredIf(cfg.largeur_bande_mhz)),
    classe_largeur_bande: new FormControl(s.classe_largeur_bande ?? null), // caché

    // min(1) seulement si le champ est visible
    nbre_tranche: new FormControl(
      s.nbre_tranche ?? null,
      [
        ...(cfg.nbre_tranche?.required ? [Validators.required] : []),
        ...(cfg.nbre_tranche?.visible ? [Validators.min(1)] : []),
      ]
    ),

    type_bande_frequence: new FormControl(s.type_bande_frequence ?? null, requiredIf(cfg.type_bande_frequence)),
    caractere_radio:      new FormControl(s.caractere_radio ?? null, requiredIf(cfg.caractere_radio)),

    zone_couverture: new FormControl(s.zone_couverture ?? null, requiredIf(cfg.zone_couverture)),
    localite:        new FormControl(s.localite ?? null, requiredIf(cfg.localite)),
  });
}


// ===============================================================
// 3. CANAL (FicheTechniqueCanalRequest)
// - classe_largeur_bande gardé dans le FormGroup (caché)
// - created_at / updated_at / updated_by ABSENTS du FormGroup
// ---------------------------------------------------------------
export function buildCanalFG(
  fb: FormBuilder,
  c: Partial<FicheTechniqueCanalRequest> = {},
  cat: CategoryId
): FormGroup {

  const cfg = CATEGORY_CONFIG[cat].canaux;

  const trancheDefault =
    cfg.nbre_tranche_facturation?.visible ? (c.nbre_tranche_facturation ?? 1) : (c.nbre_tranche_facturation ?? null);

  return fb.group({
    categorie_produit: new FormControl(c.categorie_produit ?? cat),

    type_station: new FormControl(c.type_station ?? null, requiredIf(cfg.type_station)),
    type_canal:   new FormControl(c.type_canal ?? null, requiredIf(cfg.type_canal)),

    zone_couverture: new FormControl(c.zone_couverture ?? null, requiredIf(cfg.zone_couverture)),

    // min(1) seulement si visible (sinon ça peut bloquer la soumission alors que le champ est masqué)
    nbre_tranche_facturation: new FormControl(
      trancheDefault,
      [
        ...(cfg.nbre_tranche_facturation?.required ? [Validators.required] : []),
        ...(cfg.nbre_tranche_facturation?.visible ? [Validators.min(1)] : []),
      ]
    ),

    largeur_bande_khz:    new FormControl(c.largeur_bande_khz ?? null, requiredIf(cfg.largeur_bande_khz)),
    classe_largeur_bande: new FormControl(c.classe_largeur_bande ?? null), // caché

    type_bande_frequence: new FormControl(c.type_bande_frequence ?? null, requiredIf(cfg.type_bande_frequence)),

    mode_duplexage: new FormControl(c.mode_duplexage ?? null, requiredIf(cfg.mode_duplexage)),

    // ✅ AJOUT selon la config (cat 4 & 5 visible/required)
    puissance_sortie: new FormControl(c.puissance_sortie ?? null, requiredIf(cfg.puissance_sortie)),
  });
}


// ===============================================================
// 4. HELPERS
// ---------------------------------------------------------------
export const getStationsFA = (form: FormGroup): FormArray =>
  form.get('stations') as FormArray;

export const getCanauxFA = (form: FormGroup): FormArray =>
  form.get('canaux') as FormArray;

function toNumber(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}


// ===============================================================
// 5. MAPPING VERS L’API
// ---------------------------------------------------------------
export function formToFicheTechniqueFrequenceCreateRequest(
  form: FormGroup,
  opts?: {
    updatedBy?: number | null;
    nowIso?: string; // si non fourni => new Date().toISOString()
  }
): FicheTechniqueFrequenceCreateRequest {

  const raw = form.getRawValue();
  const nowIso = opts?.nowIso ?? new Date().toISOString();
  const updatedBy = opts?.updatedBy ?? null;

  const stations = (raw.stations ?? []).map((s: FicheTechniqueStationRequest) => ({
    ...s,
  }));

  const canaux = (raw.canaux ?? []).map((c: FicheTechniqueCanalRequest) => ({
    ...c,
  }));

  return {
    ...(raw.fiche as FicheTechniqueFrequenceCreateRequest),
    stations,
    canaux,
  };
}
