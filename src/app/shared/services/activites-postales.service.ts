import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {
  ClientInfos, CompteBilanLigne,  DocumentComptableImporte, DocumentUtilise, LigneRetenue,
  RedevanceLigne, CompteImport, StatutImport
} from '../models/activites-postales';
import {AppConfigService} from '../../core/config/app-config.service';




export const MOCK_DOCUMENTS: DocumentComptableImporte[] = [
  {
    id: 1,
    nomFichier: "balance_laposte_2023.xlsx",
    ClientId: 101,
    ClientNom: "LA POSTE BURKINA",
    anneeFiscale: 2023,
    dateImport: "2025-01-10T08:30:00"
  },
  {
    id: 2,
    nomFichier: "balance_onatel_2024.xlsx",
    ClientId: 102,
    ClientNom: "ONATEL",
    anneeFiscale: 2024,
    dateImport: "2025-01-11T09:00:00"
  },
  {
    id: 3,
    nomFichier: "balance_orangemoney_2025.xlsx",
    ClientId: 103,
    ClientNom: "ORANGE MONEY",
    anneeFiscale: 2025,
    dateImport: "2025-01-11T10:15:00"
  }
];


export const MOCK_COMPTES_IMPORT: Record<number, CompteImport[]> = {
  1: [
    {
      idLigne: 11,
      numero: "701100",
      libelle: "Produits postaux",
      debit: 0,
      credit: 8_500_000,
      selectionne: true,
      statut: 'NOUVEAU'
    },
    {
      idLigne: 12,
      numero: "701200",
      libelle: "Ventes services",
      debit: 0,
      credit: 4_200_000,
      selectionne: true,
      statut: 'NOUVEAU'
    },
    {
      idLigne: 13,
      numero: "709000",
      libelle: "Rabais et remises",
      debit: 350_000,
      credit: 0,
      selectionne: false,
      statut: 'MODIFIE'
    }
  ],
  2: [
    {
      idLigne: 21,
      numero: "706101",
      libelle: "Services télécom",
      debit: 0,
      credit: 12_500_000,
      selectionne: true,
      statut: 'EXISTANT'
    },
    {
      idLigne: 22,
      numero: "706102",
      libelle: "Internet et data",
      debit: 0,
      credit: 7_200_000,
      selectionne: true,
      statut: 'EXISTANT'
    },
    {
      idLigne: 23,
      numero: "706300",
      libelle: "Autres produits",
      debit: 0,
      credit: 1_800_000,
      selectionne: false,
      statut: 'MODIFIE'
    }
  ],
  3: [
    {
      idLigne: 31,
      numero: "707001",
      libelle: "Commissions mobiles",
      debit: 0,
      credit: 9_350_000,
      selectionne: true,
      statut: 'NOUVEAU'
    },
    {
      idLigne: 32,
      numero: "707002",
      libelle: "Frais de transfert",
      debit: 0,
      credit: 6_800_000,
      selectionne: true,
      statut: 'EXISTANT'
    },
    {
      idLigne: 33,
      numero: "707003",
      libelle: "Frais divers",
      debit: 0,
      credit: 1_200_000,
      selectionne: false,
      statut: 'MODIFIE'
    }
  ]
};

export const MOCK_COMPTES_BILAN: Record<number, CompteBilanLigne[]> = {
  1: [ // LA POSTE
    {
      numero: "701100",
      libelle: "Produits postaux",
      montant: 8_500_000,
      montantEstime: 4_250_000,
      selectionne: true
    },
    {
      numero: "701200",
      libelle: "Ventes services",
      montant: 4_200_000,
      montantEstime: 2_100_000,
      selectionne: true
    },
    {
      numero: "709000",
      libelle: "Rabais",
      montant: -350_000,
      montantEstime: null,
      selectionne: false
    }
  ],

  2: [ // ONATEL
    {
      numero: "706101",
      libelle: "Services télécom",
      montant: 12_500_000,
      montantEstime: 6_250_000,
      selectionne: true
    },
    {
      numero: "706102",
      libelle: "Internet et data",
      montant: 7_200_000,
      montantEstime: 3_600_000,
      selectionne: true
    },
    {
      numero: "706300",
      libelle: "Autres produits",
      montant: 1_800_000,
      montantEstime: null,
      selectionne: false
    }
  ],

  3: [ // ORANGE MONEY
    {
      numero: "707001",
      libelle: "Commissions mobiles",
      montant: 9_350_000,
      montantEstime: 4_675_000,
      selectionne: true
    },
    {
      numero: "707002",
      libelle: "Frais de transfert",
      montant: 6_800_000,
      montantEstime: 3_400_000,
      selectionne: true
    },
    {
      numero: "707003",
      libelle: "Frais divers",
      montant: 1_200_000,
      montantEstime: 600_000,
      selectionne: false
    }
  ]
};

export const MOCK_REDEVANCES_INIT = [
  { code: "FONCT", nature: "Redevance de fonctionnement", taux: 0.5 },
  { code: "DEV",   nature: "Redevance de développement",   taux: 0.5 },
  { code: "FONDS", nature: "Fonds de compensation",        taux: 1.5 }
];


@Injectable({providedIn: 'root'})
export class ActivitesPostalesService {

  constructor(
    private httpClient: HttpClient,
    private cfg: AppConfigService
  ) {
  }



// ===== Mocks internes =====

  private readonly MOCK_DOCUMENTS: DocumentComptableImporte[] = [
    {
      id: 1,
      nomFichier: "balance_laposte_2023.xlsx",
      ClientId: 101,
      ClientNom: "LA POSTE BURKINA",
      anneeFiscale: 2023,
      dateImport: "2025-01-10T08:30:00"
    },
    {
      id: 2,
      nomFichier: "balance_onatel_2024.xlsx",
      ClientId: 102,
      ClientNom: "ONATEL",
      anneeFiscale: 2024,
      dateImport: "2025-01-11T09:00:00"
    },
    {
      id: 3,
      nomFichier: "balance_orangemoney_2025.xlsx",
      ClientId: 103,
      ClientNom: "ORANGE MONEY",
      anneeFiscale: 2025,
      dateImport: "2025-01-11T10:15:00"
    }
  ];

  private readonly MOCK_COMPTES_IMPORT: Record<number, CompteImport[]> = {
    1: [
      {
        idLigne: 11,
        numero: "701100",
        libelle: "Produits postaux",
        debit: 0,
        credit: 8_500_000,
        selectionne: true,
        statut: 'NOUVEAU'
      },
      {
        idLigne: 12,
        numero: "701200",
        libelle: "Ventes services",
        debit: 0,
        credit: 4_200_000,
        selectionne: true,
        statut: 'NOUVEAU'
      },
      {
        idLigne: 13,
        numero: "709000",
        libelle: "Rabais et remises",
        debit: 350_000,
        credit: 0,
        selectionne: false,
        statut: 'MODIFIE'
      }
    ],
    2: [
      {
        idLigne: 21,
        numero: "706101",
        libelle: "Services télécom",
        debit: 0,
        credit: 12_500_000,
        selectionne: true,
        statut: 'EXISTANT'
      },
      {
        idLigne: 22,
        numero: "706102",
        libelle: "Internet et data",
        debit: 0,
        credit: 7_200_000,
        selectionne: true,
        statut: 'EXISTANT'
      },
      {
        idLigne: 23,
        numero: "706300",
        libelle: "Autres produits",
        debit: 0,
        credit: 1_800_000,
        selectionne: false,
        statut: 'MODIFIE'
      }
    ],
    3: [
      {
        idLigne: 31,
        numero: "707001",
        libelle: "Commissions mobiles",
        debit: 0,
        credit: 9_350_000,
        selectionne: true,
        statut: 'NOUVEAU'
      },
      {
        idLigne: 32,
        numero: "707002",
        libelle: "Frais de transfert",
        debit: 0,
        credit: 6_800_000,
        selectionne: true,
        statut: 'EXISTANT'
      },
      {
        idLigne: 33,
        numero: "707003",
        libelle: "Frais divers",
        debit: 0,
        credit: 1_200_000,
        selectionne: false,
        statut: 'MODIFIE'
      }
    ]
  };

  private readonly MOCK_COMPTES_BILAN: Record<number, CompteBilanLigne[]> = {
    1: [
      { numero: "701100", libelle: "Produits postaux", montant: 8_500_000, montantEstime: 4_250_000, selectionne: true },
      { numero: "701200", libelle: "Ventes services",  montant: 4_200_000, montantEstime: 2_100_000, selectionne: true },
      { numero: "709000", libelle: "Rabais",           montant: -350_000,  montantEstime: null,       selectionne: false }
    ],
    2: [
      { numero: "706101", libelle: "Services télécom", montant: 12_500_000, montantEstime: 6_250_000, selectionne: true },
      { numero: "706102", libelle: "Internet et data", montant: 7_200_000,  montantEstime: 3_600_000, selectionne: true },
      { numero: "706300", libelle: "Autres produits",  montant: 1_800_000,  montantEstime: null,       selectionne: false }
    ],
    3: [
      { numero: "707001", libelle: "Commissions mobiles", montant: 9_350_000, montantEstime: 4_675_000, selectionne: true },
      { numero: "707002", libelle: "Frais de transfert",  montant: 6_800_000, montantEstime: 3_400_000, selectionne: true },
      { numero: "707003", libelle: "Frais divers",        montant: 1_200_000, montantEstime: 600_000,   selectionne: false }
    ]
  };

  private readonly MOCK_REDEVANCES_INIT: RedevanceLigne[] = [
    {
      code: "FONCT",
      nature: "Redevance de fonctionnement",
      baseTaxable: 0,   // sera écrasé dans le composant
      taux: 0.5,
      montantDu: 0      // sera recalculé dans le composant
    },
    {
      code: "DEV",
      nature: "Redevance de développement",
      baseTaxable: 0,
      taux: 0.5,
      montantDu: 0
    },
    {
      code: "FONDS",
      nature: "Fonds de compensation",
      baseTaxable: 0,
      taux: 1.5,
      montantDu: 0
    }
  ];


  // ===== États en mémoire (si tu veux les garder) =====

  private documents: DocumentComptableImporte[] = [];
  private comptesImport: Record<number, CompteImport[]> = {};
  private comptesBilan: Record<number, CompteBilanLigne[]> = {};

  // ===== API du service utilisée par les composants =====

  getDocuments(): DocumentComptableImporte[] {
    // si rien en mémoire → mocks
    return this.documents.length ? this.documents : this.MOCK_DOCUMENTS;
  }

  getDocument(id: number): DocumentComptableImporte | undefined {
    return this.getDocuments().find(d => d.id === id);
  }

  getComptesImport(docId: number): CompteImport[] {
    const inMemory = this.comptesImport[docId];
    if (inMemory && inMemory.length) {
      return inMemory;
    }
    return this.MOCK_COMPTES_IMPORT[docId] ?? [];
  }

  setComptesImport(docId: number, comptes: CompteImport[]): void {
    this.comptesImport[docId] = comptes;
  }

  getComptesBilan(docId: number): CompteBilanLigne[] {
    const inMemory = this.comptesBilan[docId];
    if (inMemory && inMemory.length) {
      return inMemory;
    }
    return this.MOCK_COMPTES_BILAN[docId] ?? [];
  }

  setComptesBilan(docId: number, lignes: CompteBilanLigne[]): void {
    this.comptesBilan[docId] = lignes;
  }


  getRedevancesInit(): RedevanceLigne[] {
    return this.MOCK_REDEVANCES_INIT;
  }








}
