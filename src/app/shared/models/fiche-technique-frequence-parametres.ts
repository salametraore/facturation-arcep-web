
// classe-debit.model.ts

export interface ClasseDebit {
  /** readOnly: true */
  id: number;

  /** string($date-time) */
  created_at?: string;

  /** string($date-time) */
  updated_at?: string;

  /** maxLength: 64 */
  code: string;

  /** maxLength: 255 */
  libelle: string;

  /** nullable: true */
  debit_min_kbps?: number | null;

  /** nullable: true */
  debit_max_kbps?: number | null;

  /** nullable: true */
  created_by?: number | null;

  /** nullable: true */
  updated_by?: number | null;

  /** nullable: true */
  categorie_produit?: number | null;
}



export interface ClasseLargeurBande {
  /** readOnly: true */
  id: number;

  /** string($date-time) */
  created_at?: string;

  /** string($date-time) */
  updated_at?: string;

  /** maxLength: 50 */
  code: string;

  /** maxLength: 255 */
  libelle: string;

  /**
   * string($decimal)
   * pattern: ^-?\d{0,7}(?:\.\d{0,3})?$
   * nullable: true
   */
  lb_min_mhz?: string | null;

  /**
   * string($decimal)
   * pattern: ^-?\d{0,7}(?:\.\d{0,3})?$
   * nullable: true
   */
  lb_max_mhz?: string | null;

  actif: boolean;

  /** nullable: true */
  created_by?: number | null;

  /** nullable: true */
  updated_by?: number | null;

  /** nullable: true */
  categorie_produit?: number | null;
}



export interface ClassePuissance {
  /** readOnly: true */
  id: number;

  /** string($date-time) */
  created_at?: string;

  /** string($date-time) */
  updated_at?: string;

  /** maxLength: 64 */
  code: string;

  /** maxLength: 255 */
  libelle: string;

  /**
   * string($decimal)
   * pattern: ^-?\d{0,9}(?:\.\d{0,3})?$
   * nullable: true
   */
  p_min_w?: string | null;

  /**
   * string($decimal)
   * pattern: ^-?\d{0,9}(?:\.\d{0,3})?$
   * nullable: true
   */
  p_max_w?: string | null;

  /** nullable: true */
  created_by?: number | null;

  /** nullable: true */
  updated_by?: number | null;

  /** nullable: true */
  categorie_produit?: number | null;
}

export interface TypeBandeFrequence {
  /** readOnly: true */
  id: number;

  /** maxLength: 200 */
  libelle: string;

  /** nullable: true */
  categorie_produit?: number | null;
}
