// src/app/features/parametrage/tarif-frais-dossier/tarif-frais-dossier.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { bouton_names, operations } from '../../constantes';

import { TarifFraisDossier } from '../../shared/models/tarif-frais-dossier.model';
import { Produit } from '../../shared/models/produit';

import { TarifFraisDossierService } from '../../shared/services/tarif-frais-dossier.service';
import { ProduitService } from '../../shared/services/produits.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

// ⚠️ à créer/adapter selon ton arborescence
import { TarifFraisDossierCrudComponent } from './tarif-frais-dossier-crud/tarif-frais-dossier-crud.component';

@Component({
  selector: 'app-tarif-frais-dossier',
  templateUrl: './tarif-frais-dossier.component.html'
})
export class TarifFraisDossierComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_TarifFraisDossier = new MatTableDataSource<TarifFraisDossier>([]);

  displayedColumns: string[] = [
    'produit',
    'quantite_min',
    'quantite_max',
    'prix_unitaire',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  produits: Produit[] = [];

  constructor(
    private tarifService: TarifFraisDossierService,
    private produitService: ProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre global (produit libellé + champs numériques)
    this.t_TarifFraisDossier.filterPredicate = (data: TarifFraisDossier, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const produit = (this.getProduit(data.produit) ?? '').toLowerCase();
      const qmin = (data.quantite_min ?? '').toString().toLowerCase();
      const qmax = (data.quantite_max ?? '').toString().toLowerCase();
      const prix = (data.prix_unitaire ?? '').toString().toLowerCase();

      return `${produit} ${qmin} ${qmax} ${prix}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_TarifFraisDossier.paginator = this.paginator;
    this.t_TarifFraisDossier.sort = this.sort;
  }

  reloadData(): void {
    this.tarifService.getListItems().subscribe((items: TarifFraisDossier[]) => {
      this.t_TarifFraisDossier.data = items ?? [];
      if (this.t_TarifFraisDossier.paginator) this.t_TarifFraisDossier.paginator.firstPage();
    });

    // ✅ pour afficher le libellé produit (FK)
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits ?? [];
      // retrigger filtre si déjà appliqué
      this.t_TarifFraisDossier.filter = this.t_TarifFraisDossier.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_TarifFraisDossier.filter = (value ?? '').trim().toLowerCase();
    if (this.t_TarifFraisDossier.paginator) this.t_TarifFraisDossier.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(item?: TarifFraisDossier | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '520px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { item, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(TarifFraisDossierCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(item: TarifFraisDossier): void {
    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.tarifService.delete(item.id).subscribe(
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

  /** Affichage FK produit */
  getProduit(id: any): string {
    // selon ton modèle Produit: libelle, denomination_sociale, etc.
    return this.produits?.find((p) => p.id === id)?.libelle ?? '';
  }
}
