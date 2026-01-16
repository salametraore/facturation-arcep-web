import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { ZoneCouverture } from '../../shared/models/zone-couverture';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { ZoneCouvertureService } from '../../shared/services/zone-couverture.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';


import { ZoneCouvertureCrudComponent } from './zone-couverture-crud/zone-couverture-crud.component';

@Component({
  selector: 'app-zone-couverture',
  templateUrl: './zone-couverture.component.html'
})
export class ZoneCouvertureComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_ZoneCouverture = new MatTableDataSource<ZoneCouverture>([]);

  displayedColumns: string[] = ['code', 'libelle', 'categorie_produit', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private zoneCouvertureService: ZoneCouvertureService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + libellé catégorie
    this.t_ZoneCouverture.filterPredicate = (data: ZoneCouverture, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_ZoneCouverture.paginator = this.paginator;
    this.t_ZoneCouverture.sort = this.sort;
  }

  reloadData(): void {
    this.zoneCouvertureService.getListItems().subscribe((items: ZoneCouverture[]) => {
      this.t_ZoneCouverture.data = items ?? [];
      if (this.t_ZoneCouverture.paginator) this.t_ZoneCouverture.paginator.firstPage();
    });

    // Pour afficher le libellé de la catégorie
    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // retrigger si filtre actif (car dépend de getCategorie)
      this.t_ZoneCouverture.filter = this.t_ZoneCouverture.filter;
    });
  }

  /** (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_ZoneCouverture.filter = (value ?? '').trim().toLowerCase();
    if (this.t_ZoneCouverture.paginator) this.t_ZoneCouverture.paginator.firstPage();
  }

  /** (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(zone?: ZoneCouverture | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { zoneCouverture: zone, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(ZoneCouvertureCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(zone: ZoneCouverture): void {
    if (!zone?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.zoneCouvertureService.delete(zone.id!).subscribe(
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
