// src/app/features/parametrage/regles-tarif-frequence/regles-tarif-frequence.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import {
  RegleTarifFrequence,
  ObjetEnum,
  NatureFraisEnum,
  UniteFacturationEnum,
  ScopePlafondEnum
} from '../../shared/models/regle-tarif-frequence.model';

import { RegleTarifFrequenceService } from '../../shared/services/regle-tarif-frequence.service';
import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { ReglesTarifFrequenceCrudComponent } from './regles-tarif-frequence-crud/regles-tarif-frequence-crud.component';
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {Produit} from "../../shared/models/produit";
import {ProduitService} from "../../shared/services/produits.service";


type ReglesTarifFilter = {
  q: string;                 // texte
  categorieId: number | null;
  produitId: number | null;
  objet: ObjetEnum | '';
  tick: number;              // pour forcer même si identique
};


@Component({
  selector: 'regles-tarif-frequence',
  templateUrl: './regles-tarif-frequence.component.html'
})
export class ReglesTarifFrequenceComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_Regles = new MatTableDataSource<RegleTarifFrequence>([]);

  categories: CategorieProduit[] = [];
  categoriesFiltered: CategorieProduit[] = [];
  frequenceCategorie?: CategorieProduit;
  produits: Produit[] = [];

  // --- filtres listes (appliqués via bouton/Enter uniquement) ---
  filterCategorieId: number | null = null;
  filterProduitId: number | null = null;
  filterObjet: ObjetEnum | '' = '';

  private filterTick = 0;
  private lastQuery = ''; // on mémorise le texte saisi (sans filtrer automatiquement)

  // options (alimentées à partir des données chargées)
  objetOptions: Array<{ value: ObjetEnum, label: string }> = [
    { value: 'STATION', label: 'Station' },
    { value: 'CANAL', label: 'Canal' }
  ];

  displayedColumns: string[] = [
    'categorie_produit',
    'objet',
    'nature_frais',
    'produit',
    'montant_unitaire',
    'plafond_par_dossier',
    'scope_plafond',
    'actif',
    'actions'
  ];


  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private regleService: RegleTarifFrequenceService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // filtre global + filtres listes
    this.t_Regles.filterPredicate = (data: RegleTarifFrequence, raw: string) => {
      let f: ReglesTarifFilter;

      try {
        f = JSON.parse(raw || '{}');
      } catch {
        f = { q: (raw ?? ''), categorieId: null, produitId: null, objet: '', tick: 0 };
      }

      const q = (f.q ?? '').trim().toLowerCase();

      // filtres selects (AND)
      const okCategorie = f.categorieId == null || data.categorie_produit === f.categorieId;
      const okProduit   = f.produitId == null   || data.produit === f.produitId;
      const okObjet     = !f.objet              || data.objet === f.objet;

      if (!okCategorie || !okProduit || !okObjet) return false;

      // texte
      if (!q) return true;

      const blob = [
        data.priorite ?? '',
        data.actif ? 'actif' : 'inactif',
        this.labelObjet(data.objet),
        this.labelNatureFrais(data.nature_frais),
        this.labelUniteFacturation(data.unite_facturation),

        data.categorie_produit_detail?.libelle ?? '',
        data.produit_detail?.libelle ?? '',

        data.montant_unitaire ?? '',
        data.plafond_par_dossier ?? '',
        this.labelScopePlafond(data.scope_plafond),
        data.commentaire ?? '',

        data.type_station_detail?.libelle ?? '',
        data.type_canal_detail?.libelle ?? '',
        data.zone_couverture_detail?.libelle ?? '',
        data.type_bande_frequence_detail?.libelle ?? '',
        data.classe_puissance_detail?.libelle ?? '',
        data.classe_debit_detail?.libelle ?? '',
      ].join(' ').toLowerCase();

      return blob.includes(q);
    };


  }

  ngAfterViewInit(): void {
    this.t_Regles.paginator = this.paginator;
    this.t_Regles.sort = this.sort;
  }

  reloadData(): void {

    // 1) catégories => on calcule frequenceCategorie => ensuite produits
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories ?? [];

      // sécuriser la recherche FREQ (case-insensitive)
      this.frequenceCategorie = this.categories.find(c => (c.code ?? '').toUpperCase() === 'FREQ') as CategorieProduit;

      this.categoriesFiltered = this.categories
        .filter(c => (c.id ?? 0) < 8)
        .sort((a, b) => (a.libelle ?? '').localeCompare(b.libelle ?? '', 'fr', { sensitivity: 'base' }));

      // charger produits seulement quand frequenceCategorie est dispo
      if (this.frequenceCategorie?.id != null) {
        this.produitService.getListItems().subscribe((produits: Produit[]) => {
          const all = produits ?? [];
          this.produits = all.filter(p => p.categorieProduit === this.frequenceCategorie.id);
        });
      } else {
        this.produits = [];
        console.warn("Catégorie FREQ introuvable => liste produits vide");
      }
    });

    // 2) règles
    this.regleService.getListItems().subscribe((rows: RegleTarifFrequence[]) => {
      this.t_Regles.data = rows ?? [];
      if (this.t_Regles.paginator) this.t_Regles.paginator.firstPage();
      this.applyFilters();
    });
  }


  // --- Handlers selects : NE FILTRE PAS, juste set la valeur ---
  onCategorieChange(v: any): void {
    this.filterCategorieId = (v === null || v === '' || v === undefined) ? null : Number(v);
  }

  onObjetChange(v: any): void {
    this.filterObjet = (v === null || v === '' || v === undefined) ? '' : (v as ObjetEnum);
  }

  onProduitChange(v: any): void {
    this.filterProduitId = (v === null || v === '' || v === undefined) ? null : Number(v);
  }

  /** Appliquer filtre via bouton/Enter */
  setFilter(value: string): void {
    this.applyFilters(value);
  }

  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.applyFilters('');
  }

  resetAllFilters(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.filterCategorieId = null;
    this.filterObjet = '';
    this.filterProduitId = null;
    this.applyFilters('');
  }

  applyFilters(query?: string): void {
    if (query !== undefined) {
      this.lastQuery = query;
    }

    const payload: ReglesTarifFilter = {
      q: (this.lastQuery ?? '').trim().toLowerCase(),
      categorieId: this.filterCategorieId,
      produitId: this.filterProduitId,
      objet: this.filterObjet,
      tick: ++this.filterTick,
    };

    this.t_Regles.filter = JSON.stringify(payload);

    if (this.t_Regles.paginator) this.t_Regles.paginator.firstPage();
  }


  crud(regle?: RegleTarifFrequence | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { regle, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(ReglesTarifFrequenceCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(regle: RegleTarifFrequence): void {
    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' })
      .subscribe((yes_no) => {
        if (yes_no === true) {
          this.regleService.delete(regle.id).subscribe(
            () => {
              this.msgMessageService.success('Supprimé avec succès');
              this.reloadData();
            },
            (error) => this.dialogService.alert({ message: error })
          );
        }
      });
  }

  onRowClicked(row: any): void {
    if (this.selectedRow && this.selectedRow !== row) {
      this.selectedRow = row;
    } else if (!this.selectedRow) {
      this.selectedRow = row;
    } else if (this.selectedRow === row) {
      this.selectedRow = undefined;
    }
  }

  // ---------- Helpers labels ----------
  labelObjet(v?: ObjetEnum): string {
    if (!v) return '';
    return v === 'STATION' ? 'Station' : 'Canal';
  }

  labelNatureFrais(v?: NatureFraisEnum): string {
    switch (v) {
      case 'DOSSIER': return 'Frais de dossier';
      case 'GESTION': return 'Redevance de gestion';
      case 'UTILISATION': return 'Redevance d’utilisation';
      default: return '';
    }
  }

  labelUniteFacturation(v?: UniteFacturationEnum): string {
    switch (v) {
      case 'PAR_STATION': return 'Par station';
      case 'PAR_CANAL': return 'Par canal';
      case 'PAR_TRANCHES': return 'Par tranches';
      case 'PAR_MHZ': return 'Par MHz';
      case 'PAR_RESEAU': return 'Par réseau';
      default: return '';
    }
  }

  labelScopePlafond(v?: ScopePlafondEnum): string {
    switch (v) {
      case 'DOSSIER': return 'Par dossier';
      case 'NATURE': return 'Par nature de frais';
      case 'PRODUIT': return 'Par produit';
      default: return '';
    }
  }

  // ---------- Helpers détails ----------
  private detailLabel(d: any): string {
    return d?.libelle ?? d?.code ?? '';
  }

  getCategorie(r: RegleTarifFrequence): string {
    return this.detailLabel(r.categorie_produit_detail);
  }

  getProduit(r: RegleTarifFrequence): string {
    return this.detailLabel(r.produit_detail);
  }

  getTypeStation(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).type_station_detail);
  }

  getTypeCanal(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).type_canal_detail);
  }

  getZoneCouverture(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).zone_couverture_detail);
  }

  getBandeFrequence(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).type_bande_frequence_detail);
  }

  getClassePuissance(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).classe_puissance_detail);
  }

  getClasseDebit(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).classe_debit_detail);
  }

  // affichage montant (tolérant si API renvoie string)
  money(v: any): string {
    if (v === null || v === undefined || v === '') return '';
    return `${v}`;
  }
}
