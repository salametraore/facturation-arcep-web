import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { Client } from "../../../../shared/models/client";
import { RecouvDashboardClient } from "../../../../shared/models/recouv-dashboard-client";
import { bouton_names, operations } from "../../../../constantes";

import { EncaissementsService } from "../../../../shared/services/encaissements.service";
import { ClientService } from "../../../../shared/services/client.service";
import { AuthService } from "../../../../authentication/auth.service";
import { RecouvListeEncaissement } from "../../../../shared/models/recouv-liste-encaissement";
import { ModePaiementService } from "../../../../shared/services/mode-paiement.service";
import { ModePaiement } from "../../../../shared/models/mode-paiement";

import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'client-details-encaissements',
  templateUrl: './client-details-encaissements.component.html'
})
export class ClientDetailsEncaissementsComponent implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['date_encaissement', 'montant', 'affecte', 'solde_non_affecte', 'mode_paiement'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  encaissements: RecouvListeEncaissement[];
  clients: Client[];
  client: Client;
  nomClient: string;

  modePaiements: ModePaiement[];


  t_Encaissements?: MatTableDataSource<RecouvListeEncaissement>;

  constructor(
    private encaissementsService: EncaissementsService,
    private modePaiementService: ModePaiementService,
    private clientService: ClientService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.t_Encaissements = new MatTableDataSource<RecouvListeEncaissement>([]);
  }

  ngOnInit(): void {

    this.reloadData();

  }

  ngAfterViewInit() {
    this.t_Encaissements.paginator = this.paginator;
    this.t_Encaissements.sort = this.sort;
  }

  private reloadData() {

    this.modePaiementService.getItems().subscribe((ligneModePaiements: ModePaiement[]) => {
      this.modePaiements = ligneModePaiements;
    });

    this.encaissementsService
      .getListeEncaissementsByClientId(this.clientId)
      .subscribe((lignesEncaissement: RecouvListeEncaissement[]) => {
        console.log(lignesEncaissement);
        this.encaissements = lignesEncaissement;
        this.t_Encaissements.data = this.encaissements;
      });
  }

  getModePaiement(id: number) {
    return this.modePaiements?.find(mode => mode.id === id)?.libelle;
  }
}
