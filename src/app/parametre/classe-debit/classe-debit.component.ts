// src/app/features/parametrage/classe-debit/classe-debit.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { ClasseDebit } from '../../shared/models/classe-debit.model';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { ClasseDebitService } from '../../shared/services/classe-debit.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { ClasseDebitCrudComponent } from './classe-debit-crud/classe-debit-crud.component';

@Component({
  selector: 'classe-debit',
  templateUrl: './classe-debit.component.html'
})
export class ClasseDebitComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le HTML utilise directement [dataSource]="t_ClasseDebit"
  t_ClasseDebit = new MatTableDataSource<ClasseDebit>([]);

  displayedColumns: string[] = [
    'code',
    'libelle',
    'debit_min_kbps',
    'debit_max_kbps',
    'categorie_produit',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private classeDebitService: ClasseDebitService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + min/max + catégorie(libellé)
    this.t_ClasseDebit.filterPredicate = (data: ClasseDebit, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();

      const min = (data.debit_min_kbps ?? '').toString().toLowerCase();
      const max = (data.debit_max_kbps ?? '').toString().toLowerCase();

      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${min} ${max} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_ClasseDebit.paginator = this.paginator;
    this.t_ClasseDebit.sort = this.sort;
  }

  reloadData(): void {
    // ✅ liste (peut être cachée via shareReplay dans BaseClasseService)
    this.classeDebitService.getListItems().subscribe((items: ClasseDebit[]) => {
      this.t_ClasseDebit.data = items ?? [];
      if (this.t_ClasseDebit.paginator) this.t_ClasseDebit.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // ✅ retrigger si déjà filtré
      this.t_ClasseDebit.filter = this.t_ClasseDebit.filter;
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  setFilter(value: string): void {
    this.t_ClasseDebit.filter = (value ?? '').trim().toLowerCase();
    if (this.t_ClasseDebit.paginator) this.t_ClasseDebit.paginator.firstPage();
  }

  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(item?: ClasseDebit | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;

    // ✅ aligner avec ton CRUD : data.classeDebit / data.operation
    dialogConfig.data = { classeDebit: item, operation };

    const ref = this.dialog.open(ClasseDebitCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(item: ClasseDebit): void {
    if (!item?.id) return;

    this.dialogService
      .yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' })
      .subscribe((yes_no) => {
        if (yes_no === true) {
          this.classeDebitService.delete(item.id).subscribe(
            () => {
              this.msgMessageService.success('Supprimé avec succès');
              // si cache shareReplay => on peut forcer refresh
              this.classeDebitService.refresh();
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
