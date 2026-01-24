// src/app/shared/models/caractere-radio.ts

export interface CaractereRadio {
  id: number;              // obligatoire

  code: string;            // obligatoire
  libelle: string;         // obligatoire

  created_at?: string;     // ISO date string (ex: "2026-01-24T10:30:00")
  updated_at?: string;

  created_by?: string;
  updated_by?: string;
}

/**
 * Payload pour création / mise à jour
 * (souvent identique au modèle sans "id")
 */
export interface CaractereRadioRequest {

  code: string;            // obligatoire
  libelle: string;         // obligatoire

  created_at?: string;
  updated_at?: string;

  created_by?: string;
  updated_by?: string;
}
