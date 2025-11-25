import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { bouton_names, operations } from "../../../../constantes";
import { RecouvDashboardClient } from "../../../../shared/models/recouv-dashboard-client";
import { Client } from "../../../../shared/models/client";
import { Facture } from "../../../../shared/models/facture";

import { FactureService } from "../../../../shared/services/facture.service";
import { CategorieProduitService } from "../../../../shared/services/categorie-produit.service";
import { ClientService } from "../../../../shared/services/client.service";
import { AuthService } from "../../../../authentication/auth.service";

import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'client-dfc-details-factures',
  templateUrl: './client-dfc-details-factures.component.html'
})
export class ClientDfcDetailsFacturesComponent implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['reference','objet', 'date_echeance', 'montant', 'type_frais', 'etat'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  factures: Facture[];
  clients: Client[];
  client: Client;
  nomClient: string;


  t_Factures?: MatTableDataSource<Facture>;

  constructor(
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private clientService: ClientService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
  ) {
    // initialisation de la datasource
    this.t_Factures = new MatTableDataSource<Facture>([]);
  }

  ngOnInit(): void {

    this.reloadData();

  }

  ngAfterViewInit() {
    this.t_Factures.paginator = this.paginator;
    this.t_Factures.sort = this.sort;
  }

  private reloadData() {

    this.factureService
      .getListeFacturesByClientId(this.clientId)
      .subscribe((lignesFactures: Facture[]) => {
        console.log(lignesFactures);
        this.factures = lignesFactures;
        this.t_Factures.data = this.factures;
      });

  }

}
