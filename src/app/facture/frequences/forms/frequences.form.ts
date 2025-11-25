// src/app/facture/frequences/forms/frequences.form.ts

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CategoryId } from '../../../shared/models/frequences-category.types';
import { CATEGORY_CONFIG, requiredIf } from '../config/frequences-category.config';

import {
  StationEquipementRequest,
  StationCanalRequest,
  FicheTechniqueFrequenceRequest
} from '../../../shared/models/fiche-technique-frequence';


// ===============================================================
// 1. FORMULAIRE PRINCIPAL
// ---------------------------------------------------------------
export function buildFicheTechniqueFrequenceForm(
  fb: FormBuilder,
  fiche?: FicheTechniqueFrequenceRequest
): FormGroup {

  const category: CategoryId = (fiche?.categorie_produit as CategoryId) || 1;

  return fb.group({
    fiche: fb.group({
      client:            new FormControl(fiche?.client, [Validators.required]),
      categorie_produit: new FormControl(fiche?.categorie_produit ?? category, [Validators.required]),

      // 👉 objet maintenant obligatoire
      objet:             new FormControl(fiche?.objet ?? null, [Validators.required]),

      // 👉 commentaire reste facultatif
      commentaire:       new FormControl(fiche?.commentaire ?? null),

      // tout le reste facultatif
      statut:            new FormControl(fiche?.statut ?? null),
      // direction non saisie à cette étape => pas de required
      direction:         new FormControl(fiche?.direction ?? null),
      utilisateur:       new FormControl(fiche?.utilisateur ?? null),
      date_creation:     new FormControl(fiche?.date_creation ?? null),
      position:          new FormControl(fiche?.position ?? null),
      position_direction:new FormControl(fiche?.position_direction ?? null),
      avis:              new FormControl(fiche?.avis ?? null),
      date_avis:         new FormControl(fiche?.date_avis ?? null),
      duree:             new FormControl(fiche?.duree ?? null),
      date_fin:          new FormControl(fiche?.date_fin ?? null),
      date_debut:        new FormControl(fiche?.date_debut ?? null),
      periode:           new FormControl(fiche?.periode ?? null),
      recurrente:        new FormControl(fiche?.recurrente ?? null),
    }),

    stations_equipement: fb.array([]),
    stations_canal:      fb.array([]),
  });
}


// ===============================================================
// 2. STATION EQUIPEMENT (StationEquipementRequest)
// ---------------------------------------------------------------
export function buildStationEquipementFG(
  fb: FormBuilder,
  s: Partial<StationEquipementRequest> = {},
  cat: CategoryId
): FormGroup {

  const cfg = CATEGORY_CONFIG[cat].stations;

  return fb.group({
    produit:             new FormControl(s.produit ?? null),

    type_station:        new FormControl(s.type_station ?? null,          requiredIf(cfg.type_station)),
    puissance:           new FormControl(s.puissance ?? null,             requiredIf(cfg.puissance)),
    puissance_unite:     new FormControl(s.puissance_unite ?? null),

    nbre_station:        new FormControl(s.nbre_station ?? null,          requiredIf(cfg.nbre_station)),

    debit:               new FormControl(s.debit ?? null,                 requiredIf(cfg.debit)),
    unite_debit:         new FormControl(s.unite_debit ?? null),

    largeur_bande:       new FormControl(s.largeur_bande ?? null,         requiredIf(cfg.largeur_bande)),
    largeur_bande_unite: new FormControl(s.largeur_bande_unite ?? null,   requiredIf(cfg.largeur_bande_unite)),

    bande_frequence:     new FormControl(s.bande_frequence ?? null,       requiredIf(cfg.bande_frequence)),

    caractere_commercial:new FormControl(s.caractere_commercial ?? null,  requiredIf(cfg.caractere_commercial)),
    nbre_tranche:        new FormControl(s.nbre_tranche ?? null,          requiredIf(cfg.nbre_tranche)),

    localite:            new FormControl(s.localite ?? null,              requiredIf(cfg.localite)),
  });
}


// ===============================================================
// 3. STATION CANAL (StationCanalRequest)
// ---------------------------------------------------------------
export function buildStationCanalFG(
  fb: FormBuilder,
  c: Partial<StationCanalRequest> = {},
  cat: CategoryId
): FormGroup {

  const cfg = CATEGORY_CONFIG[cat].canaux;

  return fb.group({
    produit: new FormControl(c.produit ?? 91),

    type_station:    new FormControl(c.type_station ?? null,          requiredIf(cfg.type_station)),
    type_canal:      new FormControl(c.type_canal ?? null,            requiredIf(cfg.type_canal)),

    puissance:       new FormControl(c.puissance ?? null),
    puissance_unite: new FormControl(c.puissance_unite ?? null),

    nbre_station:    new FormControl(c.nbre_station ?? null),
    debit:           new FormControl(c.debit ?? null),
    unite_debit:     new FormControl(c.unite_debit ?? null),

    largeur_bande:        new FormControl(c.largeur_bande ?? null,      requiredIf(cfg.largeur_bande)),
    largeur_bande_unite:  new FormControl(c.largeur_bande_unite ?? null,requiredIf(cfg.largeur_bande_unite)),

    bande_frequence:      new FormControl(c.bande_frequence ?? null,    requiredIf(cfg.bande_frequence)),
    caractere_commercial: new FormControl(c.caractere_commercial ?? null),

    nbre_tranche:         new FormControl(
      c.nbre_tranche ?? 1,
      [
        ...(cfg.nbre_tranche?.required ? [Validators.required] : []),
        Validators.min(1)
      ]
    ),

    zone_couverture:      new FormControl(c.zone_couverture ?? null,   requiredIf(cfg.zone_couverture)),
    localite:             new FormControl(c.localite ?? null),
  });
}


// ===============================================================
// 4. HELPERS
// ---------------------------------------------------------------
export const getStationsEquipFA = (form: FormGroup): FormArray =>
  form.get('stations_equipement') as FormArray;

export const getStationsCanalFA = (form: FormGroup): FormArray =>
  form.get('stations_canal') as FormArray;


// ===============================================================
// 5. MAPPING VERS L’API
// ---------------------------------------------------------------
export function formToFicheTechniqueFrequenceRequest(
  form: FormGroup
): FicheTechniqueFrequenceRequest {

  const raw = form.getRawValue();

  return {
    ...(raw.fiche as FicheTechniqueFrequenceRequest),
    stations_equipement: raw.stations_equipement ?? [],
    stations_canal:      raw.stations_canal ?? [],
  };
}
