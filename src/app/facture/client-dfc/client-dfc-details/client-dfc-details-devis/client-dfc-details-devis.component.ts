import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import {bouton_names, ETATS_DEVIS, TYPE_FRAIS} from "../../../../constantes";

import { Client } from "../../../../shared/models/client";


import { ActivatedRoute } from "@angular/router";
import {Devis} from "../../../../shared/models/devis";
import {DevisService} from "../../../../shared/services/devis.service";

@Component({
  selector: 'client-dfc-details-devis',
  templateUrl: './client-dfc-details-devis.component.html'
})
export class ClientDfcDetailsDevisComponent implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  t_Devis?: MatTableDataSource<Devis>;

  displayedColumns: string[] = ['reference','objet','montant', 'date', 'etat' ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  devis: Devis[];
  clients: Client[];
  client: Client;
  nomClient: string;


  TYPE_FRAIS=TYPE_FRAIS;
  etatsDevis=ETATS_DEVIS;

  constructor(
    private devisService: DevisService,
    private route: ActivatedRoute,
  ) {
    // initialisation de la datasource
    this.t_Devis = new MatTableDataSource<Devis>([]);
  }

  ngOnInit(): void {

    this.reloadData();

  }

  ngAfterViewInit() {
    this.t_Devis.paginator = this.paginator;
    this.t_Devis.sort = this.sort;
  }

  private reloadData() {

    this.devisService.getListItems().subscribe((response: Devis[]) => {
      console.log('devis retournes!!');
      console.log(response);

      const devisClient = response
      // 👉 filtre par client
        .filter(d => d.client && d.client.id === this.clientId)
        // 👉 tri décroissant par id
        .sort((a, b) => b.id - a.id);

      this.t_Devis.data = devisClient;
    });




  }

}
