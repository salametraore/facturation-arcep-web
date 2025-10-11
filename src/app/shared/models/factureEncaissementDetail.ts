
export interface FactureEncaissementDetail {
    readonly id: number;
    created_at?: string;
    updated_at?: string;
    montant_affecte: string;
    date_affectation: string;
    created_by?: number | null;
    updated_by?: number | null;
    encaissement: number;
    facture?: number | null;
    devis?: number | null;
}
