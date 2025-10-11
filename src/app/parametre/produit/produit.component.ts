import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {CategorieProduit} from "../../shared/models/categorie-produit";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {bouton_names, operations} from "../../constantes";
import {Produit} from "../../shared/models/produit";
import {ProduitService} from "../../shared/services/produits.service";
import {ProduitCrudComponent} from "./produit-crud/produit-crud.component";

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.scss'
})
export class ProduitComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;
  public operations = operations;
  public bouton_names = bouton_names;

  t_Produit?: MatTableDataSource<Produit>;

  displayedColumns: string[] = ['libelle', 'description','categorieProduit', 'actions'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  categorieProduits:CategorieProduit[];

  constructor(
    private produitService: ProduitService,
    private categorieProduitService: CategorieProduitService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.t_Produit = new MatTableDataSource<CategorieProduit>([]);
  }

  ngAfterViewInit(): void {
    this.t_Produit.paginator = this.paginator;
    this.t_Produit.sort = this.sort;
  }

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData() {
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.t_Produit.data = produits;
    });
    this.categorieProduitService.getListItems().subscribe((categorieProduits: CategorieProduit[]) => {
      this.categorieProduits = categorieProduits;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.t_Produit.filter = filterValue.trim().toLowerCase();
  }

  crud(produit?: Produit, operation?: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {produit, operation};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(ProduitCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
      this.reloadData();
    }, error => {

    });
  }

  onDelete(produit: Produit) {
    this.dialogService.yes_no({message: " Voulez-vous supprimer cet enregistrement"}).subscribe(yes_no => {
      if (yes_no === true) {
        this.categorieProduitService
          .delete(produit.id)
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

  getCategorie(id){
    return this.categorieProduits?.find(c=>c.id===id)?.libelle;
  }
}
