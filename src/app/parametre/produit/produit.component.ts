import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';
import { Produit } from '../../shared/models/produit';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { ProduitService } from '../../shared/services/produits.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';
import { ProduitCrudComponent } from './produit-crud/produit-crud.component';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html'
})
export class ProduitComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le nouveau HTML utilise directement [dataSource]="t_Produit"
  t_Produit = new MatTableDataSource<Produit>([]);

  displayedColumns: string[] = ['libelle', 'description', 'categorieProduit', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ optionnel : filtre sur libellé/description + catégorie (via libellé de catégorie)
    this.t_Produit.filterPredicate = (data: Produit, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const libelle = (data.libelle ?? '').toLowerCase();
      const description = (data.description ?? '').toLowerCase();
      const cat = (this.getCategorie(data.categorieProduit) ?? '').toLowerCase();

      return `${libelle} ${description} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_Produit.paginator = this.paginator;
    this.t_Produit.sort = this.sort;
  }

  reloadData(): void {
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.t_Produit.data = produits ?? [];
      if (this.t_Produit.paginator) this.t_Produit.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((categorieProduits: CategorieProduit[]) => {
      this.categorieProduits = categorieProduits ?? [];

      // ✅ si un filtre est déjà appliqué, on retrigger le filtrePredicate (cat libellé dépend de la liste)
      this.t_Produit.filter = this.t_Produit.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_Produit.filter = (value ?? '').trim().toLowerCase();
    if (this.t_Produit.paginator) this.t_Produit.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(produit?: Produit | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { produit, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(ProduitCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(produit: Produit): void {
    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        // ✅ correction : delete côté ProduitService
        this.produitService.delete(produit.id).subscribe(
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
