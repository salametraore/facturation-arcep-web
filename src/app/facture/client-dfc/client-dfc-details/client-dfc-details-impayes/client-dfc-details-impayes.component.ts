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

import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import {ClientDfcEncaissementCrudComponent} from "../client-dfc-encaissement-crud/client-dfc-encaissement-crud.component";

@Component({
  selector: 'client-dfc-details-impayes',
  templateUrl: './client-dfc-details-impayes.component.html'
})
export class ClientDfcDetailsImapyesComponent implements OnInit, AfterViewInit {

  @Input() clientId!: number;

  displayedColumns: string[] = ['select','type_ligne','reference','objet', 'date_emission', 'montant'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  factures: ClientFactureDevisImpayes[];
  clients: Client[];
  client: Client;
  nomClient: string;


  t_Factures?: MatTableDataSource<ClientFactureDevisImpayes>;

  selection = new SelectionModel<ClientFactureDevisImpayes>(true, []);

  selectedLignes: ClientFactureDevisImpayes[] = [];

  constructor(
    private factureService: FactureService,
    private categorieProduitService: CategorieProduitService,
    private clientService: ClientService,
    private authServiceService: AuthService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
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
        this.selection.clear();
      });

  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.t_Factures?.data?.length || 0;
    return numSelected === numRows && numRows > 0;
  }


  isSelected(ligne: ClientFactureDevisImpayes): boolean {
    return this.selectedLignes.some(l => l.id === ligne.id);
  }

  onToggleLigne(ligne: ClientFactureDevisImpayes, checked: boolean): void {
    if (checked) {
      // ajouter si pas déjà présent
      if (!this.isSelected(ligne)) {
        this.selectedLignes = [...this.selectedLignes, ligne];
      }
    } else {
      // retirer de la liste
      this.selectedLignes = this.selectedLignes.filter(l => l.id !== ligne.id);
    }
  }

  onToggleAll(checked: boolean): void {
    if (checked) {
      // tout sélectionner
      this.selectedLignes = [...(this.t_Factures?.data || [])];
    } else {
      // tout désélectionner
      this.selectedLignes = [];
    }
  }

  // ----- Ouverture modale d'encaissement -----

  onEncaisserSelection(): void {
    // aucune ligne sélectionnée → on ne fait rien
    if (!this.selectedLignes || this.selectedLignes.length === 0) {
      return;
    }

    const lignesSelectionnees = [...this.selectedLignes];

    const dialogRef = this.dialog.open(ClientDfcEncaissementCrudComponent, {
      width: '1200px',
      data: {
        clientId: this.clientId,
        lignesImpayees: lignesSelectionnees
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // si le dialog s’est bien terminé (tu peux ajuster le test selon ton besoin)
      if (result === 'Yes') {
        // on vide la sélection
        this.selectedLignes = [];
        this.selection.clear();

        // on recharge la liste des impayés
        this.reloadData();
      }
    });
  }


}
