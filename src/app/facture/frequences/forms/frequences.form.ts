// src/app/facture/frequences/forms/frequences.form.ts

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { merge, of } from 'rxjs';
import { startWith } from 'rxjs/operators';

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

    sous_type_station: new FormControl(s.sous_type_station ?? null, requiredIf(cfg.sous_type_station)),

    puissance: new FormControl(s.puissance ?? null, requiredIf(cfg.puissance)),
    classe_puissance: new FormControl(s.classe_puissance ?? null),

    nombre_station: new FormControl(s.nombre_station ?? null, requiredIf(cfg.nombre_station)),

    debit_kbps:   new FormControl(s.debit_kbps ?? null, requiredIf(cfg.debit_kbps)),
    classe_debit: new FormControl(s.classe_debit ?? null),

    largeur_bande_mhz: new FormControl(s.largeur_bande_mhz ?? null, requiredIf(cfg.largeur_bande_mhz)),
    classe_largeur_bande: new FormControl(s.classe_largeur_bande ?? null),

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
// ✅ nbre_canaux obligatoire partout
// ✅ nbre_tranche_facturation : suggestion auto, mais saisissable (pas d’écrasement)
// ---------------------------------------------------------------
const DUPLEX_CODES = new Set<string>([
  'TC_CRED_PUBLIC',
  'TC_PMR3_MOBILE',
  'TC_PMR_FIXE',
]);

const SIMPLEXE_CODES = new Set<string>([
  'TC_PMR2_MOBILE',
]);

function computeTranchesAuto(
  largeurBandeKhz: number,
  nbreCanaux: number,
  typeCanalCode?: string | null
): number {
  const largeur = Math.max(0, largeurBandeKhz || 0);
  const canaux = Math.max(1, Math.floor(nbreCanaux || 1));
  const code = (typeCanalCode ?? '').trim();

  if (DUPLEX_CODES.has(code)) {
    const raw = (canaux * largeur) / 25;
    return Math.max(1, Math.ceil(raw));
  }

  if (SIMPLEXE_CODES.has(code)) {
    const raw = (canaux * largeur) / 12.5;
    return Math.max(1, Math.ceil(raw));
  }

  // autres
  return Math.max(1, canaux);
}

export function buildCanalFG(
  fb: FormBuilder,
  c: Partial<FicheTechniqueCanalRequest> = {},
  cat: CategoryId
): FormGroup {

  const cfg = CATEGORY_CONFIG[cat].canaux;

  // ✅ nbre_canaux obligatoire partout
  const nbreCanauxDefault = (c as any)?.nbre_canaux ?? 1;

  // ✅ champ caché : code du type canal (alimenté depuis le dialog)
  const typeCanalCodeDefault = (c as any)?.type_canal_code ?? null;

  // ✅ auto init (suggestion calculée)
  const autoInit = computeTranchesAuto(
    toNumber((c as any)?.largeur_bande_khz) ?? 0,
    nbreCanauxDefault ?? 1,
    typeCanalCodeDefault
  );

  // ✅ valeur initiale : si déjà renseignée => on la respecte
  const trancheInitial = (c as any)?.nbre_tranche_facturation ?? autoInit;

  const group = fb.group({
    categorie_produit: new FormControl(c.categorie_produit ?? cat),

    type_station: new FormControl(c.type_station ?? null, requiredIf(cfg.type_station)),
    type_canal:   new FormControl(c.type_canal ?? null, requiredIf(cfg.type_canal)),

    // ✅ NOUVEAU : code type canal (caché)
    type_canal_code: new FormControl(typeCanalCodeDefault),

    // ✅ obligatoire partout
    nbre_canaux: new FormControl(
      nbreCanauxDefault,
      [Validators.required, Validators.min(1)]
    ),

    zone_couverture: new FormControl(c.zone_couverture ?? null, requiredIf(cfg.zone_couverture)),

    // ✅ saisissable + min(1)
    nbre_tranche_facturation: new FormControl(
      trancheInitial,
      [
        ...(cfg.nbre_tranche_facturation?.required ? [Validators.required] : []),
        Validators.min(1),
      ]
    ),

    largeur_bande_khz:    new FormControl(c.largeur_bande_khz ?? null, requiredIf(cfg.largeur_bande_khz)),
    classe_largeur_bande: new FormControl(c.classe_largeur_bande ?? null),

    type_bande_frequence: new FormControl(c.type_bande_frequence ?? null, requiredIf(cfg.type_bande_frequence)),

    // ✅ AJOUT : caractere_radio sur CANAL
    caractere_radio: new FormControl(c.caractere_radio ?? null, requiredIf(cfg.caractere_radio)),

    mode_duplexage: new FormControl(c.mode_duplexage ?? null, requiredIf(cfg.mode_duplexage)),

    puissance_sortie: new FormControl(c.puissance_sortie ?? null, requiredIf(cfg.puissance_sortie)),
    classe_puissance_id: new FormControl(c.classe_puissance_id ?? null),
  });

  /**
   * ✅ Suggestion dynamique SANS écrasement :
   * - si l'utilisateur a modifié (dirty) => on ne touche plus
   * - sinon, on met à jour uniquement si la valeur actuelle était "auto"
   */
  if (cfg.nbre_tranche_facturation?.visible !== false) {

    const canauxCtrl = group.get('nbre_canaux');
    const largeurCtrl = group.get('largeur_bande_khz');
    const typeCanalCodeCtrl = group.get('type_canal_code');
    const trancheCtrl = group.get('nbre_tranche_facturation');

    if (canauxCtrl && largeurCtrl && trancheCtrl) {

      let lastAutoComputed = autoInit;

      const recompute = () => {
        const nCanaux = Math.max(1, Math.floor(toNumber(canauxCtrl.value) ?? 1));
        const largeur = toNumber(largeurCtrl.value) ?? 0;
        const code = (typeCanalCodeCtrl?.value ?? null) as string | null;

        const auto = computeTranchesAuto(largeur, nCanaux, code);

        // ✅ si l'utilisateur a tapé une valeur => stop auto-update
        if (trancheCtrl.dirty) {
          lastAutoComputed = auto;
          return;
        }

        const current = toNumber(trancheCtrl.value);

        // ✅ on considère "auto" si null OU égal au dernier auto calculé
        const isAutoValue = current == null || current === lastAutoComputed;

        if (isAutoValue) {
          trancheCtrl.setValue(auto, { emitEvent: false });
        }

        lastAutoComputed = auto;
      };

      merge(
        canauxCtrl.valueChanges,
        largeurCtrl.valueChanges,
        typeCanalCodeCtrl?.valueChanges ?? of(null),
      )
        .pipe(startWith(null))
        .subscribe(() => recompute());

      // 🔥 premier calcul
      recompute();
    }
  }

  return group;
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
    nowIso?: string;
  }
): FicheTechniqueFrequenceCreateRequest {

  const raw = form.getRawValue();

  const stations = (raw.stations ?? []).map((s: FicheTechniqueStationRequest) => ({
    ...s,
  }));

  // ✅ On enlève le champ caché type_canal_code avant envoi API (safe)
  const canaux = (raw.canaux ?? []).map((c: any) => {
    const { type_canal_code, ...rest } = c;
    return rest as FicheTechniqueCanalRequest;
  });

  return {
    ...(raw.fiche as FicheTechniqueFrequenceCreateRequest),
    stations,
    canaux,
  };
}
