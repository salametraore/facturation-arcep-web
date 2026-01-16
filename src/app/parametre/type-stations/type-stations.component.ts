// src/app/type-directions/pages/type-direction/type-bandes-frequence.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { TypeStation } from '../../shared/models/type-station';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { TypeStationService } from '../../shared/services/type-station.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { TypeStationsCrudComponent } from './type-stations-crud/type-stations-crud.component';

@Component({
  selector: 'type-stations',
  templateUrl: './type-stations.component.html'
})
export class TypeStationsComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le nouveau HTML utilise directement [dataSource]="t_TypeStations"
  t_TypeStations = new MatTableDataSource<TypeStation>([]);

  displayedColumns: string[] = ['code', 'libelle', 'categorie_produit', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private typeStationService: TypeStationService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + libellé catégorie
    this.t_TypeStations.filterPredicate = (data: TypeStation, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_TypeStations.paginator = this.paginator;
    this.t_TypeStations.sort = this.sort;
  }

  reloadData(): void {
    this.typeStationService.getListItems().subscribe((items: TypeStation[]) => {
      this.t_TypeStations.data = items ?? [];
      if (this.t_TypeStations.paginator) this.t_TypeStations.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // ✅ retrigger le filtre si déjà appliqué (cat dépend du référentiel)
      this.t_TypeStations.filter = this.t_TypeStations.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_TypeStations.filter = (value ?? '').trim().toLowerCase();
    if (this.t_TypeStations.paginator) this.t_TypeStations.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(typeStation?: TypeStation | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;

    // ✅ aligné avec le CRUD : data.typeStation / data.operation
    dialogConfig.data = { typeStation, operation };

    dialogConfig.disableClose = true;

    const ref = this.dialog.open(TypeStationsCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(typeStation: TypeStation): void {
    if (!typeStation?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.typeStationService.delete(typeStation.id!).subscribe(
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

  getCategorie(id: any): string {
    return this.categorieProduits?.find((c) => c.id === id)?.libelle ?? '';
  }
}
