// src/app/features/parametrage/classe-puissance/classe-puissance.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { ClassePuissance } from '../../shared/models/classe-puissance.model';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { ClassePuissanceService } from '../../shared/services/classe-puissance.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { ClassePuissanceCrudComponent } from './classe-puissance-crud/classe-puissance-crud.component';

@Component({
  selector: 'classe-puissance',
  templateUrl: './classe-puissance.component.html'
})
export class ClassePuissanceComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le HTML utilise directement [dataSource]="t_ClassePuissance"
  t_ClassePuissance = new MatTableDataSource<ClassePuissance>([]);

  displayedColumns: string[] = [
    'code',
    'libelle',
    'p_min_w',
    'p_max_w',
    'categorie_produit',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private classePuissanceService: ClassePuissanceService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + plage puissance + libellé catégorie
    this.t_ClassePuissance.filterPredicate = (data: ClassePuissance, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const pmin = (data.p_min_w ?? '').toString().toLowerCase();
      const pmax = (data.p_max_w ?? '').toString().toLowerCase();
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${pmin} ${pmax} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_ClassePuissance.paginator = this.paginator;
    this.t_ClassePuissance.sort = this.sort;
  }

  reloadData(): void {
    this.classePuissanceService.getListItems().subscribe((items: ClassePuissance[]) => {
      this.t_ClassePuissance.data = items ?? [];
      if (this.t_ClassePuissance.paginator) this.t_ClassePuissance.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // ✅ retrigger filtre (car dépend du référentiel catégories)
      this.t_ClassePuissance.filter = this.t_ClassePuissance.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_ClassePuissance.filter = (value ?? '').trim().toLowerCase();
    if (this.t_ClassePuissance.paginator) this.t_ClassePuissance.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(classePuissance?: ClassePuissance | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;

    // ✅ aligner avec le CRUD : data.classePuissance / data.operation
    dialogConfig.data = { classePuissance, operation };

    dialogConfig.disableClose = true;

    const ref = this.dialog.open(ClassePuissanceCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(item: ClassePuissance): void {
    if (!item?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.classePuissanceService.delete(item.id).subscribe(
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
