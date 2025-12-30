import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { bouton_names, operations } from '../../constantes';
import { CategorieProduit } from '../../shared/models/categorie-produit';
import { CategorieProduitService } from '../../shared/services/categorie-produit.service';
import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';
import { CategorieProduitCrudComponent } from './categorie-produit-crud/categorie-produit-crud.component';

@Component({
  selector: 'app-categorie-produit',
  templateUrl: './categorie-produit.component.html'
})
export class CategorieProduitComponent implements OnInit, AfterViewInit {
  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ le nouveau HTML utilise directement [dataSource]="t_CategorieProduit"
  t_CategorieProduit = new MatTableDataSource<CategorieProduit>([]);

  displayedColumns: string[] = ['code', 'libelle', 'description', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ optionnel : filtre par défaut sur code/libelle/description
    this.t_CategorieProduit.filterPredicate = (data: CategorieProduit, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const code = (data.code ?? '').toLowerCase();
      const libelle = (data.libelle ?? '').toLowerCase();
      const description = (data.description ?? '').toLowerCase();

      return `${code} ${libelle} ${description}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_CategorieProduit.paginator = this.paginator;
    this.t_CategorieProduit.sort = this.sort;
  }

  reloadData(): void {
    this.categorieProduitService.getListItems().subscribe((response: CategorieProduit[]) => {
      this.t_CategorieProduit.data = response ?? [];

      // ✅ si on recharge, on garde le filtre/pagination cohérents
      if (this.t_CategorieProduit.paginator) {
        this.t_CategorieProduit.paginator.firstPage();
      }
    });
  }

  /** ✅ filtre sans Event (pour boutons / reset / etc.) */
  setFilter(value: string): void {
    this.t_CategorieProduit.filter = (value ?? '').trim().toLowerCase();

    if (this.t_CategorieProduit.paginator) {
      this.t_CategorieProduit.paginator.firstPage();
    }
  }

  /** ✅ reset complet */
  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  /** ✅ garde aussi la compatibilité (keyup) */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  crud(categorieProduit?: CategorieProduit | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = { categorieProduit, operation };
    dialogConfig.disableClose = true;

    const ref = this.dialog.open(CategorieProduitCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(categorieProduit: CategorieProduit): void {
    this.dialogService
      .yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' })
      .subscribe((yes_no) => {
        if (yes_no === true) {
          this.categorieProduitService.delete(categorieProduit.id).subscribe(
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
