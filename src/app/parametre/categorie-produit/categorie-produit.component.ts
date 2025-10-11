import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {bouton_names, operations} from "../../constantes";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {CategorieProduitCrudComponent} from "./categorie-produit-crud/categorie-produit-crud.component";

@Component({
  selector: 'app-categorie-produit',
  templateUrl: './categorie-produit.component.html',
  styleUrl: './categorie-produit.component.scss'
})
export class CategorieProduitComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;
  public operations = operations;
  public bouton_names = bouton_names;

  t_CategorieProduit?: MatTableDataSource<CategorieProduit>;

  displayedColumns: string[] = ['code','libelle', 'description', 'actions'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_CategorieProduit = new MatTableDataSource<CategorieProduit>([]);
  }


  ngAfterViewInit(): void {
    this.t_CategorieProduit.paginator = this.paginator;
    this.t_CategorieProduit.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData() {
    this.categorieProduitService.getListItems().subscribe((response: any) => {
      this.t_CategorieProduit.data = response;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_CategorieProduit.filter = filterValue.trim().toLowerCase();
  }

  crud(categorieProduit?: CategorieProduit, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {categorieProduit, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(CategorieProduitCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(categorieProduit: CategorieProduit) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.categorieProduitService
          .delete(categorieProduit.id)
          .subscribe(
            (data) => {
              this.msgMessageService.success('Supprimé avec succès');
              this.reloadData();
            },
            (error => {
              this.dialogService.alert({message: error});
            })
          );
      }
    });
  }

  onRowClicked(row) {
    if (this.selectedRow && this.selectedRow != row) {
      this.selectedRow = row;
    } else if (!this.selectedRow) {
      this.selectedRow = row;
    } else if (this.selectedRow === row) {
      this.selectedRow = undefined;
    }
  }
}
