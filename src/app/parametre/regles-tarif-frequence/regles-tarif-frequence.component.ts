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

// ⚠️ À créer si besoin (CRUD Dialog)
import { ReglesTarifFrequenceCrudComponent } from './regles-tarif-frequence-crud/regles-tarif-frequence-crud.component';

@Component({
  selector: 'regles-tarif-frequence',
  templateUrl: './regles-tarif-frequence.component.html'
})
export class ReglesTarifFrequenceComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_Regles = new MatTableDataSource<RegleTarifFrequence>([]);

  displayedColumns: string[] = [
    'priorite',
    'actif',
    'objet',
    'nature_frais',
    'unite_facturation',
    'categorie_produit',
    'produit',
    'montant_unitaire',
    'plafond_par_dossier',
    'scope_plafond',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private regleService: RegleTarifFrequenceService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // filtre global (inclut labels *_detail si présents)
    this.t_Regles.filterPredicate = (data: RegleTarifFrequence, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const blob = [
        data.priorite ?? '',
        data.actif ? 'actif' : 'inactif',
        this.labelObjet(data.objet),
        this.labelNatureFrais(data.nature_frais),
        this.labelUniteFacturation(data.unite_facturation),
        this.getCategorie(data),
        this.getProduit(data),
        data.montant_unitaire ?? '',
        data.plafond_par_dossier ?? '',
        this.labelScopePlafond(data.scope_plafond),
        data.commentaire ?? '',
        this.getTypeStation(data),
        this.getTypeCanal(data),
        this.getZoneCouverture(data),
        this.getBandeFrequence(data),
        this.getClassePuissance(data),
        this.getClasseDebit(data),
        this.getCaractereRadio(data),
        this.getClasseLargeurBande(data),
      ].join(' ').toLowerCase();

      return blob.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_Regles.paginator = this.paginator;
    this.t_Regles.sort = this.sort;
  }

  reloadData(): void {
    this.regleService.getListItems().subscribe((rows: RegleTarifFrequence[]) => {
      this.t_Regles.data = rows ?? [];
      if (this.t_Regles.paginator) this.t_Regles.paginator.firstPage();
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_Regles.filter = (value ?? '').trim().toLowerCase();
    if (this.t_Regles.paginator) this.t_Regles.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
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

  // ---------- Helpers détails (API renvoie souvent *_detail) ----------
  private detailLabel(d: any): string {
    return d?.libelle ?? d?.code ?? '';
  }

  getCategorie(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).categorie_produit_detail);
  }

  getProduit(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).produit_detail);
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

  getCaractereRadio(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).caractere_radio_detail);
  }

  getClasseLargeurBande(r: RegleTarifFrequence): string {
    return this.detailLabel((r as any).classe_largeur_bande_detail);
  }

  // affichage montant (tolérant si API renvoie string)
  money(v: any): string {
    if (v === null || v === undefined || v === '') return '';
    return `${v}`;
  }
}
