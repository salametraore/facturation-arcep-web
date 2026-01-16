// src/app/shared/models/classe-debit.model.ts

export class ClasseDebit {
  id: number;

  created_at?: string; // ISO date-time
  updated_at?: string; // ISO date-time

  code: string;        // maxLength: 64
  libelle: string;     // maxLength: 255

  debit_min_kbps?: number; // integer nullable
  debit_max_kbps?: number; // integer nullable

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}

/**
 * Payload API pour create/update
 */
export class ClasseDebitRequest {
  created_at?: string;
  updated_at?: string;

  code: string;
  libelle: string;

  debit_min_kbps?: number;
  debit_max_kbps?: number;

  created_by?: number;
  updated_by?: number;

  categorie_produit?: number;
}
