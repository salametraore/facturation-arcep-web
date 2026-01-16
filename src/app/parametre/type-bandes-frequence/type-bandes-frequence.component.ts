import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { TypeBandeFrequence } from '../../shared/models/typeBandeFrequenceDetail';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { TypeBandesFrequenceService } from '../../shared/services/type-bandes-frequence.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { TypeBandesFrequenceCrudComponent } from './type-bandes-frequence-crud/type-bandes-frequence-crud.component';

@Component({
  selector: 'type-bandes-frequence',
  templateUrl: './type-bandes-frequence.component.html'
})
export class TypeBandesFrequenceComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le nouveau HTML utilise directement [dataSource]="t_TypeBandeFrequence"
  t_TypeBandeFrequence = new MatTableDataSource<TypeBandeFrequence>([]);

  displayedColumns: string[] = ['code', 'libelle', 'categorie_produit', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private typeBandesFrequenceService: TypeBandesFrequenceService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + catégorie(libellé)
    this.t_TypeBandeFrequence.filterPredicate = (data: TypeBandeFrequence, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_TypeBandeFrequence.paginator = this.paginator;
    this.t_TypeBandeFrequence.sort = this.sort;
  }

  reloadData(): void {
    this.typeBandesFrequenceService.getListItems().subscribe((items: TypeBandeFrequence[]) => {
      this.t_TypeBandeFrequence.data = items ?? [];
      if (this.t_TypeBandeFrequence.paginator) this.t_TypeBandeFrequence.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // retrigger filtre (car cat libellé dépend de la liste)
      this.t_TypeBandeFrequence.filter = this.t_TypeBandeFrequence.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_TypeBandeFrequence.filter = (value ?? '').trim().toLowerCase();
    if (this.t_TypeBandeFrequence.paginator) this.t_TypeBandeFrequence.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(typeBandeFrequence?: TypeBandeFrequence | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { typeBandeFrequence, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(TypeBandesFrequenceCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(item: TypeBandeFrequence): void {
    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.typeBandesFrequenceService.delete(item.id).subscribe(
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
