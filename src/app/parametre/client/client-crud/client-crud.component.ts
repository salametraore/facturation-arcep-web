import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { Produit } from '../../../shared/models/produit';
import { Client } from '../../../shared/models/client';
import { ReleveCompteClient } from '../../../shared/models/ligne-releve-compte-client';
import { RecouvDashboardClient } from '../../../shared/models/recouv-dashboard-client';

import { FicheTechniquesService } from '../../../shared/services/fiche-techniques.service';
import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { ProduitService } from '../../../shared/services/produits.service';
import { ClientService } from '../../../shared/services/client.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import { PdfViewService } from '../../../shared/services/pdf-view.service';
import { AuthService } from '../../../authentication/auth.service';

import { bouton_names, operations } from '../../../constantes';

@Component({
  selector: 'app-client-crud',
  templateUrl: './client-crud.component.html'
})
export class ClientCrudComponent implements OnInit, AfterViewInit {

  recouvDashboardClient?: RecouvDashboardClient;
  fixeCategorie?: number;

  form!: FormGroup; // (si utilisé dans ton template)
  mode = '';
  title = '';

  categories: CategorieProduit[] = [];
  produits: Produit[] = [];
  clients: Client[] = [];
  client!: Client | undefined;

  public operations = operations;
  public data_operation = '';

  errorMessage: any;
  nomClient: any;

  // Datasource + colonnes
  t_ReleveCompteClient = new MatTableDataSource<ReleveCompteClient>([]);
  displayedColumns: string[] = [
    'type_ligne',
    'reference',
    'date_echeance',
    'montant_facture',
    'montant_encaissement'
  ];

  // Paginator / Sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Totaux
  totalFacture = 0;
  totalEncaissement = 0;          // peut être négatif selon tes données
  soldeGlobal = 0;                // totalFacture + totalEncaissement

  date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    public dialog: MatDialog,
    private pdfViewService: PdfViewService,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService,
    public dialogRef: MatDialogRef<ClientCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authServiceService: AuthService
  ) {
    this.recouvDashboardClient = data?.recouvDashboardClient;
    this.data_operation = data?.operation;
    this.fixeCategorie = data?.fixeCategorie;
  }

  ngOnInit(): void {
    this.reloadData();
  }

  ngAfterViewInit(): void {
    // Brancher pagination + tri
    this.t_ReleveCompteClient.paginator = this.paginator;
    this.t_ReleveCompteClient.sort = this.sort;

    // Tri correct sur la date (nombre) + sécuriser montants en nombre
    this.t_ReleveCompteClient.sortingDataAccessor = (item: ReleveCompteClient, property: string): any => {
      switch (property) {
        case 'date_echeance':
          return item?.date_echeance ? new Date(item.date_echeance).getTime() : 0;
        case 'montant_facture':
          return Number(item?.montant_facture) || 0;
        case 'montant_encaissement':
          return Number(item?.montant_encaissement) || 0;
        default:
          return (item as any)?.[property];
      }
    };

    // Recalcul des totaux à chaque changement de rendu (tri/pagination/filtre/données)
    this.t_ReleveCompteClient.connect().subscribe(() => this.recomputeTotals());
  }

  reloadData(): void {
    const toTime = (d: any) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients ?? [];

      if (this.recouvDashboardClient?.client_id) {
        // Mode "par client"
        this.client = this.clients.find(c => c.id === this.recouvDashboardClient!.client_id);
        this.nomClient = this.client?.denomination_sociale ?? '';

        this.clientService
          .getReleveCompteClientByIdClient(this.recouvDashboardClient.client_id)
          .subscribe((rows: ReleveCompteClient[]) => {
            const sorted = [...(rows ?? [])].sort((a, b) => toTime(a?.date_echeance) - toTime(b?.date_echeance));
            this.t_ReleveCompteClient.data = sorted;
            this.paginator?.firstPage?.();
          });
      } else {
        // Mode "tous clients"
        this.clientService.getReleveCompteClient().subscribe((rows: ReleveCompteClient[]) => {
          this.t_ReleveCompteClient.data = rows ?? [];
          this.paginator?.firstPage?.();
        });
      }
    });

    // (optionnel) charger produits si utile ailleurs dans ce composant
    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = (produits ?? []).filter(p => p.categorieProduit === this.fixeCategorie);
    });
  }

  private recomputeTotals(): void {
    const data = this.t_ReleveCompteClient.filteredData?.length
      ? this.t_ReleveCompteClient.filteredData
      : this.t_ReleveCompteClient.data;

    this.totalFacture = data.reduce((sum, row: any) => sum + (Number(row?.montant_facture) || 0), 0);
    this.totalEncaissement = data.reduce((sum, row: any) => sum + (Number(row?.montant_encaissement) || 0), 0);
    this.soldeGlobal = this.totalFacture + this.totalEncaissement;
  }

  // (optionnel) filtre global — à appeler si tu ajoutes un champ de recherche
  applyFilter(value: string): void {
    this.t_ReleveCompteClient.filter = (value || '').trim().toLowerCase();
  }

  onFerme(): void {
    this.dialogRef.close('Yes');
  }

  onGetClient(client: Client): void {
    this.client = client;
  }

  onPrintReleveClient(): void {
    if (!this.client?.id) {
      this.dialogService.alert({ message: 'Veuillez d’abord sélectionner un client.' });
      return;
    }
    this.clientService.genererRelevePDF(this.client.id).subscribe({
      next: (response: HttpResponse<Blob>) => this.pdfViewService.printDirectly(response),
      error: (error) => this.dialogService.alert({ message: error })
    });
  }
}
