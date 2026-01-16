// src/app/features/parametrage/classe-largeur-bande/classe-largeur-bande.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { ClasseLargeurBande } from '../../shared/models/classe-largeur-bande.model';
import { CategorieProduit } from '../../shared/models/categorie-produit';

import { ClasseLargeurBandeService } from '../../shared/services/classe-largeur-bande.service';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { ClasseLargeurBandeCrudComponent } from './classe-largeur-bande-crud/classe-largeur-bande-crud.component';

@Component({
  selector: 'classe-largeur-bande',
  templateUrl: './classe-largeur-bande.component.html'
})
export class ClasseLargeurBandeComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ HTML utilise [dataSource]="t_ClasseLargeurBande"
  t_ClasseLargeurBande = new MatTableDataSource<ClasseLargeurBande>([]);

  displayedColumns: string[] = [
    'code',
    'libelle',
    'lb_min_mhz',
    'lb_max_mhz',
    'actif',
    'categorie_produit',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categorieProduits: CategorieProduit[] = [];

  constructor(
    private classeLargeurBandeService: ClasseLargeurBandeService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre: code + libellé + min/max + actif + libellé catégorie
    this.t_ClasseLargeurBande.filterPredicate = (data: ClasseLargeurBande, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();

      const min = (data.lb_min_mhz ?? '').toString().toLowerCase();
      const max = (data.lb_max_mhz ?? '').toString().toLowerCase();

      const actif = (data.actif === false ? 'non' : 'oui');
      const cat = (this.getCategorie(data.categorie_produit) ?? '').toLowerCase();

      return `${code} ${libelle} ${min} ${max} ${actif} ${cat}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_ClasseLargeurBande.paginator = this.paginator;
    this.t_ClasseLargeurBande.sort = this.sort;
  }

  reloadData(): void {
    // ✅ getListItems() est caché (shareReplay) côté BaseClasseService
    this.classeLargeurBandeService.getListItems().subscribe((items: ClasseLargeurBande[]) => {
      this.t_ClasseLargeurBande.data = items ?? [];
      if (this.t_ClasseLargeurBande.paginator) this.t_ClasseLargeurBande.paginator.firstPage();
    });

    this.categorieProduitService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats ?? [];
      // ✅ retrigger si déjà filtré
      this.t_ClasseLargeurBande.filter = this.t_ClasseLargeurBande.filter;
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_ClasseLargeurBande.filter = (value ?? '').trim().toLowerCase();
    if (this.t_ClasseLargeurBande.paginator) this.t_ClasseLargeurBande.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(classe?: ClasseLargeurBande | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;

    // ✅ aligner avec le CRUD : data.classeLargeurBande / data.operation
    dialogConfig.data = { classeLargeurBande: classe, operation };

    dialogConfig.disableClose = true;

    const ref = this.dialog.open(ClasseLargeurBandeCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(classe: ClasseLargeurBande): void {
    if (!classe?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.classeLargeurBandeService.delete(classe.id).subscribe(
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
    if (this.selectedRow && this.selectedRow !== row) this.selectedRow = row;
    else if (!this.selectedRow) this.selectedRow = row;
    else if (this.selectedRow === row) this.selectedRow = undefined;
  }

  getCategorie(id: any): string {
    return this.categorieProduits?.find((c) => c.id === id)?.libelle ?? '';
  }

  // ✅ affichage friendly
  getActifLabel(actif: boolean): string {
    return actif === false ? 'Non' : 'Oui';
  }
}
