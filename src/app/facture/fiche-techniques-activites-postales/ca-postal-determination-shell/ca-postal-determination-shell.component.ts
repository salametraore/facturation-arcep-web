import {Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';

import {
  ChiffreAffairePostale,
  LigneChiffreAffairePostale,
  ChiffreAffairePostaleCreateWithFileRequest,
  ValiderChiffreAffairePostalRequest,
  LigneValiderChiffreAffairePostalRequest
} from '../../../shared/models/activites-postales-chiffres-affaires';

import { ActivitesPostalesChiffresAffairesService } from '../../../shared/services/activites-postales-chiffres-affaires.services';
import { ImportBilanDialogComponent } from '../import-bilan-dialog/import-bilan-dialog.component';
import {ClientService} from "../../../shared/services/client.service";
import {Client} from "../../../shared/models/client";


@Component({
  selector: 'app-ca-postal-determination-shell',
  templateUrl: './ca-postal-determination-shell.component.html'
})
export class CaPostalDeterminationShellComponent implements OnInit {

  @ViewChild('stepper', { static: false }) stepper!: MatStepper;

  // Config unique de la ventilation : UI + payload backend
  readonly redevanceConfig = [
    { key: 'fonctionnement', label: 'Redevence de fonctionnement', taux: 0.5 },
    { key: 'developpement',  label: 'Redevence de développement',  taux: 0.5 },
    { key: 'compensation',   label: 'Fonds de compensation',       taux: 1.5 }
  ];

  /** Colonnes du tableau de bilans/chiffres d’affaires */
  docDisplayedColumns = ['client', 'date_chargement', 'chiffre_affaire', 'actions'];

  /** Colonnes des lignes de CA postal */
  lignesBilanDisplayedColumns = [
    'select',
    'numero_compte',
    'libelle_compte',
    'montant',
    'montant_estime'
  ];

  /** Liste des objets ChiffreAffairePostale (bilan + lignes + montants de synthèse) */
  chiffreAffairePostales: ChiffreAffairePostale[] = [];

  /** Objet courant sélectionné */
  chiffreAffairePostaleCourant: ChiffreAffairePostale | null = null;

  /** Lignes du CA postal du document courant (copie modifiable côté front) */
  lignesBilan: LigneChiffreAffairePostale[] = [];



  loadingDocs = false;
  loadingLignes = false;
  saving = false;

  clients: Client[] = [];
  clientLibellesById = new Map<number, string>();

  step1Completed = false;
  step2Completed = false;
  step3Completed = false;

  resume: {
    message: string;
    totalCa: number;
    totalLignes: number;
    ficheUrl?: string | null;
  } | null = null;

  constructor(
    private caPostalService: ActivitesPostalesChiffresAffairesService,
    private dialog: MatDialog,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerClients();
    this.chargerChiffreAffaires();
  }

  /** Lignes retenues pour le CA postal */
  get lignesSelectionnees(): LigneChiffreAffairePostale[] {
    return this.lignesBilan.filter(l => l.retenu);
  }

  /** Total du CA postal estimé (somme des montant_estime) */
  get totalCaPostal(): number {
    return this.lignesSelectionnees.reduce(
      (sum, l) => sum + (l.montant_estime ?? 0),
      0
    );
  }
  get totalMontantsRetenus(): number {
    return this.totalCaPostal;
  }

// Sert à l’affichage de la carte “Ventilation des redevances”
  get ventilationRedevances() {
    const base = this.totalCaPostal;
    return this.redevanceConfig.map(r => ({
      ...r,
      base,
      montant: Math.round(base * r.taux / 100)
    }));
  }

  get totalRedevances(): number {
    return this.ventilationRedevances.reduce((sum, r) => sum + r.montant, 0);
  }

  private formatMontant(value: number | null | undefined): string | null {
    if (value == null) {
      return null;
    }
    return `${Math.trunc(value)}`;
  }


  chargerClients(): void {
    this.clientService.getItems().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.clientLibellesById.clear();
        for (const c of clients) {
          this.clientLibellesById.set(c.id, c.denomination_sociale  || `${c.id}`);
        }
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des clients.', 'Fermer', { duration: 5000 });
      }
    });
  }

  getClientLibelle(clientId: number | null | undefined): string {
    if (!clientId) {
      return '';
    }
    return this.clientLibellesById.get(clientId) ?? `Client #${clientId}`;
  }

  /** Charger la liste des ChiffreAffairePostale existants */
  chargerChiffreAffaires(): void {
    this.loadingDocs = true;
    this.caPostalService.getListItems().subscribe({
      next: docs => {
        console.log(docs);
        this.chiffreAffairePostales = docs;
        this.loadingDocs = false;
      },
      error: () => {
        this.loadingDocs = false;
        this.snackBar.open('Erreur lors du chargement des bilans.', 'Fermer', { duration: 5000 });
      }
    });
  }

  /** Ouvrir le dialog d’import de fichier bilan */
  ouvrirImportDialog(): void {
    const dialogRef = this.dialog.open(ImportBilanDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'import-ok') {
        this.chargerChiffreAffaires();
      }
    });
  }

  /** Sélection d’un document / bilan pour travailler dessus */
  selectionnerChiffreAFfaireCourant(ca: ChiffreAffairePostale): void {

    console.log("ChiffreAffairePostale selectionneé :");
    console.log(ca);
    if (this.chiffreAffairePostaleCourant?.id === ca.id) {
      return;
    }
    this.step1Completed = true;
    this.step2Completed = false;
    this.step3Completed = false;
    this.resume = null;

    this.chargerDetailChiffreAffaire(ca.id);
  }



  /** Aller à l’étape 2 depuis la liste */
  allerEtape2(): void {
    if (this.step1Completed && this.stepper) {
      this.stepper.next();
    }
  }


  /** Charger le détail (dont les lignes) via getItem(id) */
  chargerDetailChiffreAffaire(id: number): void {
    this.loadingLignes = true;
    this.lignesBilan = [];
    this.chiffreAffairePostaleCourant = null;

    this.caPostalService.getItem(id).subscribe({
      next: ca => {
        this.chiffreAffairePostaleCourant = ca;

        this.lignesBilan = (ca.lignes || []).map(l => {
          // 1) montant bilan => number (à partir d'un string ou number)
          const montantBilan = l.montant
            ? parseFloat(String(l.montant).replace(',', '.'))
            : 0;

          // 2) déterminer si montant_estime est "vide" côté backend
          const brutEstime = l.montant_estime as any;
          const estimeVide =
            brutEstime == null ||
            brutEstime === '' ||
            brutEstime === 0 ||
            brutEstime === '0' ||
            brutEstime === '0.0';

          // 3) valeur numérique pour montant_estime
          let montantEstime: number;
          if (estimeVide) {
            montantEstime = montantBilan;
          } else {
            montantEstime = typeof brutEstime === 'string'
              ? parseFloat(brutEstime.replace(',', '.'))
              : brutEstime;
          }

          return {
            ...l,
            // on garde l.montant tel quel pour le modèle
            montant_estime: Math.trunc(montantEstime), // entier
            retenu: l.retenu ?? true
          };
        });

        this.loadingLignes = false;
      },
      error: () => {
        this.loadingLignes = false;
        this.snackBar.open('Erreur lors du chargement des lignes du bilan.', 'Fermer', { duration: 5000 });
      }
    });
  }


  /** Coche/décoche une ligne comme retenue pour le CA postal */
  onToggleSelection(ligne: LigneChiffreAffairePostale): void {
    ligne.retenu = !ligne.retenu;
  }

  /** Revenir à l’étape 1 et réinitialiser l’écran */
  revenirEtape1(): void {
    this.chargerChiffreAffaires();
    this.chiffreAffairePostaleCourant = null;
    this.lignesBilan = [];

    if (this.stepper) {
      this.stepper.reset();
    }

    this.step1Completed = false;
    this.step2Completed = false;
    this.step3Completed = false;
    this.resume = null;
  }

  /** Aller à l’étape 3 : récapitulatif (sans appeler le backend) */
  allerEtape3(): void {
    if (!this.chiffreAffairePostaleCourant) {
      this.snackBar.open('Veuillez d’abord sélectionner un document.', 'Fermer', { duration: 4000 });
      return;
    }

    if (!this.lignesSelectionnees.length) {
      this.snackBar.open('Aucune ligne sélectionnée pour le CA postal.', 'Fermer', { duration: 4000 });
      return;
    }

    this.step2Completed = true;

    // On prépare un premier résumé local
    this.resume = {
      message: 'Prévisualisation du chiffre d’affaires postal avant validation.',
      totalCa: this.totalCaPostal,
      totalLignes: this.lignesSelectionnees.length,
      ficheUrl: (this.chiffreAffairePostaleCourant as any).fiche_technique_url ?? null
    };

    if (this.stepper) {
      this.stepper.next();
    }
  }

  validerChiffreAffairePostal(): void {
    if (!this.chiffreAffairePostaleCourant) {
      this.snackBar.open('Veuillez d’abord sélectionner un document.', 'Fermer', { duration: 4000 });
      return;
    }

    if (this.chiffreAffairePostaleCourant.etat === 'TRAITE') {
      this.snackBar.open(
        'Ce chiffre d’affaires postal est déjà traité, la validation n’est plus possible.',
        'Fermer',
        { duration: 4000 }
      );
      return;
    }

    if (!this.lignesSelectionnees.length) {
      this.snackBar.open('Aucune ligne sélectionnée pour le CA postal.', 'Fermer', { duration: 4000 });
      return;
    }

    // Base = total des montants estimés retenus (même que dans la carte UI)
    const base = this.totalCaPostal;

    // Ventilation calculée UNE fois à partir de la config
    const [fonct, dev, comp] = this.ventilationRedevances;

    // Construction des lignes envoyées au backend
    const lignesPayload: LigneValiderChiffreAffairePostalRequest[] = this.lignesBilan.map(l => ({
      id: l.id,
      taux: l.taux ?? 0,
      retenu: !!l.retenu,
      montant_estime: l.montant_estime ?? null
    }));

    const payload: ValiderChiffreAffairePostalRequest = {
      chiffre_affaire_postale_id: this.chiffreAffairePostaleCourant.id,

      // CA global (base taxable)
      chiffre_affaire: this.formatMontant(base),

      // Fonctionnement
      taux_fonctionnement: `${fonct.taux}`,                    // ex: "0.5"
      montant_fonctionnement: this.formatMontant(fonct.montant),

      // Développement
      taux_developpement: `${dev.taux}`,
      montant_developpement: this.formatMontant(dev.montant),

      // Compensation
      taux_compensation: `${comp.taux}`,
      montant_compensation: this.formatMontant(comp.montant),

      // Lignes détaillées
      lignes: lignesPayload
    };

    console.log("payload a sauvegarder");
    console.log(payload);

    this.saving = true;

    this.caPostalService.validerChiffreAffairePostal(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.snackBar.open(
          'Chiffre d’affaires postal validé et fiche générée avec succès.',
          'Fermer',
          { duration: 5000 }
        );

        const caMaj = res as ChiffreAffairePostale;
        this.chiffreAffairePostaleCourant = caMaj;

        // On remet à jour les lignes côté front à partir de la réponse
        this.lignesBilan = (caMaj.lignes || []).map(l => {
          const montantBilan = l.montant
            ? parseFloat(String(l.montant).replace(',', '.'))
            : 0;

          const brutEstime = l.montant_estime as any;
          const estimeVide =
            brutEstime == null ||
            brutEstime === '' ||
            brutEstime === 0 ||
            brutEstime === '0' ||
            brutEstime === '0.0';

          let montantEstime: number;
          if (estimeVide) {
            montantEstime = montantBilan;
          } else {
            montantEstime = typeof brutEstime === 'string'
              ? parseFloat(brutEstime.replace(',', '.'))
              : brutEstime;
          }

          return {
            ...l,
            montant_estime: Math.trunc(montantEstime),
            retenu: l.retenu ?? true
          };
        });

        this.chargerChiffreAffaires();

        this.resume = {
          ...(this.resume || {
            totalCa: this.totalCaPostal,
            totalLignes: this.lignesSelectionnees.length
          }),
          message: 'Chiffre d’affaires postal validé et fiche générée avec succès.',
          ficheUrl: (caMaj as any).fiche_technique_url ?? null
        };

        this.step3Completed = true;
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la validation du CA postal.', 'Fermer', { duration: 5000 });
      }
    });
  }

}
