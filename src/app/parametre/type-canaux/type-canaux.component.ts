import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { TypeCanal } from '../../shared/models/typeCanal';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { TypeCanauxService } from '../../shared/services/type-canaux.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { TypeCanauxCrudComponent } from './type-canaux-crud/type-canaux-crud.component';

@Component({
  selector: 'type-canaux',
  templateUrl: './type-canaux.component.html'
})
export class TypeCanauxComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le nouveau HTML utilise directement [dataSource]="t_TypeCanaux"
  t_TypeCanaux = new MatTableDataSource<TypeCanal>([]);

  displayedColumns: string[] = ['code', 'libelle', 'categorie_produit', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private typeCanauxService: TypeCanauxService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + libellé catégorie (via référentiel catégorie)
    this.t_TypeCanaux.filterPredicate = (data: TypeCanal, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_TypeCanaux.paginator = this.paginator;
    this.t_TypeCanaux.sort = this.sort;
  }

  reloadData(): void {
    this.typeCanauxService.getListItems().subscribe((items: TypeCanal[]) => {
      this.t_TypeCanaux.data = items ?? [];
      if (this.t_TypeCanaux.paginator) this.t_TypeCanaux.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // ✅ retrigger si déjà filtré (cat libellé dépend du référentiel)
      this.t_TypeCanaux.filter = this.t_TypeCanaux.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_TypeCanaux.filter = (value ?? '').trim().toLowerCase();
    if (this.t_TypeCanaux.paginator) this.t_TypeCanaux.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(typeCanal?: TypeCanal | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;

    // ✅ aligner avec le CRUD : data.typeCanal / data.operation
    dialogConfig.data = { typeCanal, operation };

    dialogConfig.disableClose = true;

    const ref = this.dialog.open(TypeCanauxCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(typeCanal: TypeCanal): void {
    if (!typeCanal?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.typeCanauxService.delete(typeCanal.id!).subscribe(
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
