// src/app/type-directions/pages/type-direction/type-bandes-frequence.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { bouton_names, operations } from '../../constantes';

import {Utilisateur, UtilisateurRole} from '../../shared/models/utilisateur.model';
import { TypeDirection } from '../../shared/models/typeDirection';

import { UtilisateurCrudService } from '../../shared/services/utilisateur-crud.service';
import { TypeDirectionsService } from '../../shared/services/type-directions.services';

import { DialogService } from '../../shared/services/dialog.service';
import { MsgMessageServiceService } from '../../shared/services/msg-message-service.service';

import { UtilisateursExternesCrudComponent } from './utilisateurs-externes-crud/utilisateurs-externes-crud.component';
import {DirectionsService} from "../../shared/services/directions.services";
import {Direction} from "../../shared/models/direction";
import {AuthService} from "../../authentication/auth.service";

@Component({
  selector: 'utilisateurs-externes',
  templateUrl: './utilisateurs-externes.component.html'
})
export class UtilisateursExternesComponent implements OnInit, AfterViewInit {

  selectedRow: any = undefined;

  public operations = operations;
  public bouton_names = bouton_names;

  // ✅ datasource
  t_Utilisateurs = new MatTableDataSource<Utilisateur>([]);

  displayedColumns: string[] = [
    'username',
    'nom',
    'telephone',
    'email',
    'direction',
    'actions'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  typeDirections: TypeDirection[] = [];
  directions: Direction[] = [];
  roleUtilisateurConnecte:UtilisateurRole;

  constructor(
    private utilisateurService: UtilisateurCrudService,
    private typeDirectionsService: TypeDirectionsService,
    private directionsService: DirectionsService,
    private authService:AuthService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private msgMessageService: MsgMessageServiceService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // ✅ filtre : username / nom / prenom / tel / email / direction libellé / roles
    this.t_Utilisateurs.filterPredicate = (data: Utilisateur, filter: string) => {
      const f = (filter ?? '').trim().toLowerCase();
      if (!f) return true;

      const username = (data.username ?? '').toLowerCase();
      const nom = (data.last_name ?? '').toLowerCase();
      const prenom = (data.first_name ?? '').toLowerCase();
      const tel = (data.telephone ?? '').toLowerCase();
      const email = (data.email ?? '').toLowerCase();

      const direction = (this.getDirectionLibelle(data.direction) ?? '').toLowerCase();


      return `${username} ${nom} ${prenom} ${tel} ${email} ${direction}`.includes(f);
    };
  }

  ngAfterViewInit(): void {
    this.t_Utilisateurs.paginator = this.paginator;
    this.t_Utilisateurs.sort = this.sort;
  }

  reloadData(): void {

    this.utilisateurService.getListItems().subscribe((users: Utilisateur[]) => {
      this.t_Utilisateurs.data = (users ?? []).filter(u => u.nature === 'CLIENT');
      this.t_Utilisateurs.paginator?.firstPage();
    });

    // 🔸 directions (pour l’affichage du libellé)
    this.typeDirectionsService.getItems().subscribe((dirs: TypeDirection[]) => {
      this.typeDirections = dirs ?? [];
    });

    this.directionsService.getItems().subscribe((dirs: Direction[]) => {
      this.directions = dirs ?? [];
      // retrigger filtre si déjà appliqué
      this.t_Utilisateurs.filter = this.t_Utilisateurs.filter;
    });


  }

  /** (keyup)="applyFilter($event)" */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.setFilter(value);
  }

  /** (click)="setFilter(input.value)" */
  setFilter(value: string): void {
    this.t_Utilisateurs.filter = (value ?? '').trim().toLowerCase();
    if (this.t_Utilisateurs.paginator) this.t_Utilisateurs.paginator.firstPage();
  }

  /** (click)="resetFilter(input)" */
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
    if (this.selectedRow && this.selectedRow !== row) {
      this.selectedRow = row;
    } else if (!this.selectedRow) {
      this.selectedRow = row;
    } else if (this.selectedRow === row) {
      this.selectedRow = undefined;
    }
  }

  getDirectionLibelle(directionId?: number | null): string {
    if (!directionId) return '';
    return this.directions?.find(d => d.id === directionId)?.libelle ?? '';
  }

  getRolesLibelle(u: Utilisateur): string {
    const roles = (u.roles_detail ?? []).map(r => r.libelle || r.code).filter(Boolean);
    return roles.join(', ');
  }

  getNomComplet(u: Utilisateur): string {
    const prenom = u.first_name ?? '';
    const nom = u.last_name ?? '';
    return `${prenom} ${nom}`.trim();
  }
}
