// src/app/parametre/utilisateurs-externes/utilisateurs-externes.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { bouton_names, operations } from '../../constantes';
import { Utilisateur } from '../../shared/models/utilisateur.model';

import { UtilisateurCrudService } from '../../shared/services/utilisateur-crud.service';
import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { UtilisateursExternesCrudComponent } from './utilisateurs-externes-crud/utilisateurs-externes-crud.component';
import {Client} from "../../shared/models/client";
import {ClientService} from "../../shared/services/client.service";

@Component({
  selector: 'utilisateurs-externes',
  templateUrl: './utilisateurs-externes.component.html'
})
export class UtilisateursExternesComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  t_Utilisateurs = new MatTableDataSource<Utilisateur>([]);
  clients:Client[]=[];
  private clientNameById = new Map<number, string>();


  // ✅ direction supprimé, portail_role + client_id ajoutés
  displayedColumns: string[] = [
    'username',
    'nom',
    'telephone',
    'email',
    'client',
    'portail_role',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private utilisateurService: UtilisateurCrudService,
    private clientService: ClientService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre : username / nom / prenom / tel / email / client_id / portail_role
    this.t_Utilisateurs.filterPredicate = (data: Utilisateur, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const username = (data.username ?? '').toLowerCase();
      const nom = (data.last_name ?? '').toLowerCase();
      const prenom = (data.first_name ?? '').toLowerCase();
      const tel = (data.telephone ?? '').toLowerCase();
      const email = (data.email ?? '').toLowerCase();
      const clientId = (data.client?? '').toString().toLowerCase();
      const portailRole = (data.portail_role ?? '').toLowerCase();

      return `${username} ${nom} ${prenom} ${tel} ${email} ${clientId} ${portailRole}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_Utilisateurs.paginator = this.paginator;
    this.t_Utilisateurs.sort = this.sort;
  }

  reloadData(): void {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients ?? [];

      this.buildClientIndex(); // ✅ important
    });

    this.utilisateurService.getListItems().subscribe((users: Utilisateur[]) => {
      // ✅ externes = CLIENT
      console.log(users);
      this.t_Utilisateurs.data = (users ?? []).filter(u => u.nature === 'CLIENT');
      this.t_Utilisateurs.paginator?.firstPage();
    });

  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  setFilter(value: string): void {
    this.t_Utilisateurs.filter = (value ?? '').trim().toLowerCase();
    if (this.t_Utilisateurs.paginator) this.t_Utilisateurs.paginator.firstPage();
  }

  resetFilter(input?: HTMLInputElement): void {
    if (input) input.value = '';
    this.setFilter('');
  }

  crud(utilisateur?: Utilisateur | null, operation?: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1000px';
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = { utilisateur, operation };

    const ref = this.dialog.open(UtilisateursExternesCrudComponent, dialogConfig);
    ref.afterClosed().subscribe(() => this.reloadData());
  }

  onDelete(utilisateur: Utilisateur): void {
    this.dialogService.yes_no({ message: 'Voulez-vous supprimer cet enregistrement ?' })
      .subscribe((yes_no) => {
        if (yes_no === true) {
          this.utilisateurService.delete(utilisateur.id).subscribe(
            () => {
              this.msgMessageService.success('Supprimé avec succès');
              this.reloadData();
            },
            (error) => this.dialogService.alert({ message: error })
          );
        }
      });
  }

  onRowClicked(row: any): void {
    if (this.selectedRow && this.selectedRow !== row) this.selectedRow = row;
    else if (!this.selectedRow) this.selectedRow = row;
    else if (this.selectedRow === row) this.selectedRow = undefined;
  }

  getNomComplet(u: Utilisateur): string {
    const prenom = u.first_name ?? '';
    const nom = u.last_name ?? '';
    return `${prenom} ${nom}`.trim();
  }

  getPortailRoleLabel(role?: string | null): string {
    if (!role) return '—';
    return role === 'PORTAIL_PAIEMENT' ? 'PORTAIL_PAIEMENT' : 'PORTAIL_CONSULTATION';
  }

  private buildClientIndex(): void {
    this.clientNameById.clear();
    for (const c of (this.clients ?? [])) {
      if (typeof c.id === 'number') {
        this.clientNameById.set(c.id, c.denomination_sociale ?? '');
      }
    }
  }

  getClientName(clientId: number | null | undefined): string {
    if (!clientId) return '';
    return this.clientNameById.get(clientId) ?? '';
  }
}
