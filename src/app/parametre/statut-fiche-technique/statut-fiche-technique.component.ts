import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';

import { StatutFicheTechnique } from '../../shared/models/statut-fiche-technique';
import { StatutFicheTechniqueService } from '../../shared/services/statut-fiche-technique.service';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { StatutFicheTechniqueCrudComponent } from './statut-fiche-technique-crud/statut-fiche-technique-crud.component';

@Component({
  selector: 'statut-fiche-technique',
  templateUrl: './statut-fiche-technique.component.html'
})
export class StatutFicheTechniqueComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_StatutFicheTechnique = new MatTableDataSource<StatutFicheTechnique>([]);

  displayedColumns: string[] = ['code', 'libelle', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private statutService: StatutFicheTechniqueService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre sur code + libellé
    this.t_StatutFicheTechnique.filterPredicate = (data: StatutFicheTechnique, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();

      return `${code} ${libelle}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_StatutFicheTechnique.paginator = this.paginator;
    this.t_StatutFicheTechnique.sort = this.sort;
  }

  reloadData(): void {
    this.statutService.getListItems().subscribe((items: StatutFicheTechnique[]) => {
      this.t_StatutFicheTechnique.data = items ?? [];
      if (this.t_StatutFicheTechnique.paginator) this.t_StatutFicheTechnique.paginator.firstPage();
    });
  }

  /** ✅ Pour (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** ✅ Pour (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_StatutFicheTechnique.filter = (value ?? '').trim().toLowerCase();
    if (this.t_StatutFicheTechnique.paginator) this.t_StatutFicheTechnique.paginator.firstPage();
  }

  /** ✅ Pour (click)="resetFilter(input)" */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(statut?: StatutFicheTechnique | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { statutFicheTechnique: statut, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(StatutFicheTechniqueCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(statut: StatutFicheTechnique): void {
    if (!statut?.id) return;

    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' }).subscribe((yes_no) => {
      if (yes_no === true) {
        this.statutService.delete(statut.id!).subscribe(
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
}
