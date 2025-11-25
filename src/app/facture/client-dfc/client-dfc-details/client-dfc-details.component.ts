import {AfterViewInit, Component, Optional, Inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatPaginator} from "@angular/material/paginator";
import {Facture} from "../../../shared/models/facture";
import {Client} from "../../../shared/models/client";
import {RecouvDashboardClient} from "../../../shared/models/recouv-dashboard-client";
import {ClientService} from "../../../shared/services/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import {Utilisateur} from "../../../shared/models/utilisateur";
import {AuthService} from "../../../authentication/auth.service";
import {Role, UtilisateurRole} from "../../../shared/models/droits-utilisateur";

import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DialogService} from "../../../shared/services/dialog.service";
import {date_converte, operations} from "../../../constantes";

@Component({
  selector: 'client-dfc-details',
  templateUrl: './client-dfc-details.component.html'
})
export class ClientDfcDetailsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'numeroFacture', 'libelle', 'echeance', 'montant', 'resteDu', 'penalites', 'statut'];

  selection = new SelectionModel<Facture>(true, []);

  public operations = operations;

  client: Client;
  nomClient: string;
  clientId : number;
  fixeCategorie: number=9;

  detailFicheClient?: RecouvDashboardClient;
  t_Factures: MatTableDataSource<Facture> = new MatTableDataSource<Facture>([]);
  utilisateurConnecte:Utilisateur;
  roleUtilisateurConnecte:UtilisateurRole;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private authService:AuthService,
    public dialog: MatDialog,
    public dialogService: DialogService,
  ) {  }

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {

  }

  ngOnInit(): void {

    this.utilisateurConnecte=this.authService.getConnectedUser();
    this.roleUtilisateurConnecte=this.authService.getConnectedUtilisateurRole();


    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      if (id) {

        this.clientId = id;

        this.clientService.getItem(id).subscribe(client => {
          this.client = client;
        });

      }

    });

    console.log("role utilisateur Connecte");
    console.log(this.roleUtilisateurConnecte);
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

  }

  onRetour() {
    this.router.navigate(
      ['/facture/client-direction-technique'],
    );
  }

  hasOperationCode( opCode: string): boolean {
    const  user=this.roleUtilisateurConnecte;

    if (!user || !opCode) return false;

    const needle = opCode.trim().toLowerCase();

    // Normaliser: accepter user.role = Role | Role[]
    const roles: Role[] = Array.isArray((user as any).role)
      ? (user as any).role
      : (user as any).role
        ? [ (user as any).role ]
        : [];


    for (const role of roles) {
      for (const op of (role?.operations ?? [])) {
        if ((op.code ?? '').trim().toLowerCase() === needle) return true;
      }
    }
    return false;
  }



  test() {

  }

}

