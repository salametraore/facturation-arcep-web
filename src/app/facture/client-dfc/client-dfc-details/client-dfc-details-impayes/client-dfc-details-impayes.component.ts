import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { Client } from "../../../../shared/models/client";
import { Facture,ClientFactureDevisImpayes } from "../../../../shared/models/facture";

import { FactureService } from "../../../../shared/services/facture.service";
import { CategorieProduitService } from "../../../../shared/services/categorie-produit.service";
import { ClientService } from "../../../../shared/services/client.service";
import { AuthService } from "../../../../authentication/auth.service";

import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'client-dfc-details-impayes',
  templateUrl: './client-dfc-details-impayes.component.html'
})
export class ClientDfcDetailsImapyesComponent implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['type_ligne','reference','objet', 'date_emission', 'montant'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  factures: ClientFactureDevisImpayes[];
  clients: Client[];
  client: Client;
  nomClient: string;


  t_Factures?: MatTableDataSource<ClientFactureDevisImpayes>;

  constructor(
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private clientService: ClientService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
  ) {
    // initialisation de la datasource
    this.t_Factures = new MatTableDataSource<ClientFactureDevisImpayes>([]);
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
      .getListeDevisEtFacturesImpayesByClientId(this.clientId)
      .subscribe((lignesImpayees: ClientFactureDevisImpayes[]) => {
        console.log(lignesImpayees);
        this.factures = lignesImpayees;
        this.t_Factures.data = this.factures;
      });

  }

}
