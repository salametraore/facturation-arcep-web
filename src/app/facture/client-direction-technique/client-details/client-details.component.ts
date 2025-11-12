import {AfterViewInit, Component, Optional, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Facture} from "../../../shared/models/facture";
import {Client} from "../../../shared/models/client";
import {RecouvDashboardClient} from "../../../shared/models/recouv-dashboard-client";
import {bouton_names, operations} from "../../../constantes";
import {DetailFicheClient} from "../../../shared/models/detail-fiche-client";
import {FactureService} from "../../../shared/services/facture.service";
import {CategorieProduitService} from "../../../shared/services/categorie-produit.service";
import {ClientService} from "../../../shared/services/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'numeroFacture', 'libelle', 'echeance', 'montant', 'resteDu', 'penalites', 'statut'];
  ///dataSource = new MatTableDataSource<Facture>(FACTURES_DATA);
  selection = new SelectionModel<Facture>(true, []);

  factures: Facture[];
  clients: Client[];
  client: Client;
  nomClient: any;
  fixeCategorie: number;

  public operations = operations;
  public data_operation: string = '';

  detailFicheClient?: RecouvDashboardClient;
  t_Factures: MatTableDataSource<Facture> = new MatTableDataSource<Facture>([]);


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Optional() public dialogRef: MatDialogRef<ClientDetailsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private clientService: ClientService,
  ) {
    this.detailFicheClient = this.data?.detailFicheClient ?? this.data?.recouvDashboardClient;
    this.data_operation = this.data?.operation;
    this.fixeCategorie = this.data?.fixeCategorie;
    this.t_Factures = new MatTableDataSource<Facture>([]);
  }

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.t_Factures.paginator = this.paginator;
    // si tri utilisé :
    if (this.sort) {
      this.t_Factures.sort = this.sort;
    }
  }

  ngOnInit(): void {
    ///this.reloadData();

    // 1) Si on vient du dialog, data est présent
    if (this.data?.recouvDashboardClient || this.data?.detailFicheClient) {
      this.detailFicheClient = this.data?.recouvDashboardClient ?? this.data?.detailFicheClient;
      this.data_operation = this.data?.operation;
      this.fixeCategorie = this.data?.fixeCategorie;
      this.reloadData();
      return;
    }


    // 2) Sinon, on est en mode page : on lit l'id route
    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      if (id) {
        this.clientService.getItem(id).subscribe(client => {
          this.client = client;
          this.nomClient = client?.denomination_sociale;
          this.clientService.getReleveCompteClientByIdClient(id).subscribe(lignes => {
            const toTime = (d: any) => d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;
            this.paginator?.firstPage?.();
          });
        });
      }
    });
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.t_Factures.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.t_Factures.data.forEach(row => this.selection.select(row));
    }
  }

  onFerme() {
    if (this.dialogRef) {
      this.dialogRef.close('Yes');
    } else {
      this.router.navigate(['/clients']); // ou history.back();
    }
  }

  private reloadData() {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;

      if (this.detailFicheClient) {
        this.client = clients?.find(c => c.id === this.detailFicheClient?.client_id);
        this.nomClient = this.client?.denomination_sociale;

        this.factureService.getListeFacturesByClientId(this.detailFicheClient?.client_id).subscribe((lignesFactures: Facture[]) => {

          this.factures = lignesFactures;
          this.t_Factures.data = this.factures;
        });
      }
    });
  }


}

