import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { DetailFicheClient } from "../../../../shared/models/detail-fiche-client";
import { CategorieProduit } from "../../../../shared/models/categorie-produit";
import { Produit } from "../../../../shared/models/produit";
import { Client } from "../../../../shared/models/client";
import { ReleveCompteClient } from "../../../../shared/models/ligne-releve-compte-client";

import { FicheTechniquesService } from "../../../../shared/services/fiche-techniques.service";
import { CategorieProduitService } from "../../../../shared/services/categorie-produit.service";
import { ClientService } from "../../../../shared/services/client.service";
import { AuthService } from "../../../../authentication/auth.service";

import { operations } from "../../../../constantes";
import { RecouvDashboardClient } from "../../../../shared/models/recouv-dashboard-client";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'client-dfc-details-releve-compte',
  templateUrl: './client-dfc-details-releve-compte.component.html'
})
export class ClientDfcDetailsReleveCompteComponent implements OnInit, AfterViewInit {

  @Input() clientId?: number;

  form: FormGroup;
  mode: string = '';
  title: string = '';

  client: Client;

  errorMessage: any;
  nomClient: any;
  t_ReleveCompteClient?: MatTableDataSource<ReleveCompteClient>;

  // Totaux à afficher
  totalFacture = 0;
  totalEncaissement = 0;
  soldeGlobal = 0; // Montant Facture + Montant Encaissement (montant encaissement étant négatif)

  displayedColumns: string[] = [
    'type_ligne',
    'reference',
    'date_echeance',
    'montant_facture',
    'montant_encaissement'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.t_ReleveCompteClient = new MatTableDataSource<ReleveCompteClient>([]);
  }

  ngOnInit(): void {

    this.reloadData();

  }

  ngAfterViewInit(): void {
    this.t_ReleveCompteClient.paginator = this.paginator;
    this.t_ReleveCompteClient.sort = this.sort;
  }

  reloadData() {

    const toTime = (d: any) => d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;

    this.clientService
      .getReleveCompteClientByIdClient(this.clientId)
      .subscribe((ligneReleveCompteClients: ReleveCompteClient[]) => {
        console.log(ligneReleveCompteClients);
        const sorted = [...ligneReleveCompteClients].sort(
          (a, b) => toTime(a?.date_echeance) - toTime(b?.date_echeance)
        );
        this.t_ReleveCompteClient.data = sorted;
        this.paginator?.firstPage?.();
        this.recomputeTotals(); // recalcul après chargement
      });

  }

  private recomputeTotals(): void {
    const data = this.t_ReleveCompteClient?.filteredData ?? this.t_ReleveCompteClient?.data ?? [];
    this.totalFacture = data.reduce(
      (sum, row: any) => sum + (Number(row?.montant_facture) || 0), 0
    );
    this.totalEncaissement = data.reduce(
      (sum, row: any) => sum + (Number(row?.montant_encaissement) || 0), 0
    );
    this.soldeGlobal = this.totalFacture + this.totalEncaissement; // totalEncaissement étant négatif
  }

  onSubmit() {
    console.log('this.techSheetForm.value');
  }

  onImport() {
    console.log('Importer des documents');
  }

  onNewClient() {
    console.log('Ajouter un nouveau client');
  }

  onFerme() {
    // Anciennement: this.dialogRef.close('Yes');
    // En mode page, on revient en arrière ou à la liste
    this.router.navigate(['../'], { relativeTo: this.route });
    // ou si tu préfères :
    // this.router.navigate(['/recouvrement/fiches-clients']);
  }

  onGetClient(client: Client) {
    this.client = client;
  }
}
