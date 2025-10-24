
export class TarifFraisDossierList {
    readonly id: number;
    produit: number;
    quantite_min?: number;
    quantite_max?: number | null;
    prix_unitaire: string;
}

