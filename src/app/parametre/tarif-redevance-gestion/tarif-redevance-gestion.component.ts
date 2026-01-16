// src/app/features/parametrage/tarif-redevance-gestion/tarif-redevance-gestion.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { TarifRedevanceGestion } from '../../shared/models/tarif-redevance-gestion.model';
import { Produit } from '../../shared/models/produit';

import { TarifRedevanceGestionService } from '../../shared/services/tarif-redevance-gestion.service';
import { ProduitService } from '../../shared/services/produits.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { TarifRedevanceGestionCrudComponent } from './tarif-redevance-gestion-crud/tarif-redevance-gestion-crud.component';

@Component({
  selector: 'tarif-redevance-gestion',
  templateUrl: './tarif-redevance-gestion.component.html'
})
export class TarifRedevanceGestionComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_Tarif = new MatTableDataSource<TarifRedevanceGestion>([]);

  displayedColumns: string[] = [
    'produit',
    'puissance_min',
    'puissance_max',
    'prix_unitaire',
    'montant_min_reseau',
    'component_desc',
    'zone',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  produits: Produit[] = [];

  constructor(
    private tarifService: TarifRedevanceGestionService,
    private produitService: ProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // filtre : produit(libellé) + zone + champs numériques + description
    this.t_Tarif.filterPredicate = (data: TarifRedevanceGestion, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const p = (this.getProduitLabel(data.produit) ?? '').toLowerCase();
      const zone = `${data.zone ?? ''}`.toLowerCase();

      const pmin = `${data.puissance_min ?? ''}`.toLowerCase();
      const pmax = `${data.puissance_max ?? ''}`.toLowerCase();
      const pu = `${data.prix_unitaire ?? ''}`.toLowerCase();
      const mmr = `${data.montant_min_reseau ?? ''}`.toLowerCase();
      const desc = `${data.component_desc ?? ''}`.toLowerCase();

      return `${p} ${zone} ${pmin} ${pmax} ${pu} ${mmr} ${desc}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_Tarif.paginator = this.paginator;
    this.t_Tarif.sort = this.sort;
  }

  reloadData(): void {
    this.tarifService.getListItems().subscribe((items: TarifRedevanceGestion[]) => {
      this.t_Tarif.data = items ?? [];
      if (this.t_Tarif.paginator) this.t_Tarif.paginator.firstPage();
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits ?? [];
      // retrigger filtre si déjà posé (car dépend du libellé produit)
      this.t_Tarif.filter = this.t_Tarif.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_Tarif.filter = (value ?? '').trim().toLowerCase();
    if (this.t_Tarif.paginator) this.t_Tarif.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(item?: TarifRedevanceGestion | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { item, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(TarifRedevanceGestionCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(item: TarifRedevanceGestion): void {
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

  getProduitLabel(id: any): string {
    return this.produits?.find((p) => p.id === id)?.libelle ?? '';
  }
}
