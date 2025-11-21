import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  ClientInfos,
  CompteBilanLigne,
  DocumentComptableImporte,
  DocumentUtilise,
  LigneRetenue,
  RedevanceLigne,
  CompteImport,
  StatutImport,
} from '../../../shared/models/activites-postales';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ImportDocumentDialogComponent } from '../import-document-dialog/import-document-dialog.component';
import { ActivitesPostalesService } from "../../../shared/services/activites-postales.service";


@Component({
  selector: 'app-import-documents',
  templateUrl: './import-documents.component.html',
  styleUrls: ['./import-documents.component.scss']   // ✅ styleUrls avec s
})
export class ImportDocumentsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'nomFichier',
    'entreprise',
    'anneeFiscale',
    'dateImport',
    'actions'
  ];

  dataSource = new MatTableDataSource<DocumentComptableImporte>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private workflow: ActivitesPostalesService
  ) {}

  ngOnInit(): void {
    // 1) On récupère ce que le service a éventuellement en mémoire
    let docs = this.workflow.getDocuments
      ? this.workflow.getDocuments()
      : [];

    // 2) Si rien dans le service, on utilise les mocks locaux
    this.dataSource.data = this.workflow.getDocuments();

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    // filtre simple sur nom fichier + entreprise
    this.dataSource.filterPredicate = (row, filter) =>
      (row.nomFichier + ' ' + row.ClientNom)
        .toLowerCase()
        .includes(filter);
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  onImporter(): void {
    const dialogRef = this.dialog.open(ImportDocumentDialogComponent, {
      width: '600px',
      // data: { ... }  // si tu veux passer quelque chose au dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result = doc créé (ou 'success')
        // ➜ rafraîchir la liste depuis le backend
        this.workflow.getDocuments(); // ou une méthode type reload
        // si getDocuments() renvoie un observable :
        this.dataSource.data = this.workflow.getDocuments();
        // ou mieux : this.workflow.fetchDocuments().subscribe(...)
      }
    });
  }

  traiter(doc: DocumentComptableImporte): void {
    // va à l’étape [2] : import des comptes pour ce document
    this.router.navigate([
      '/facture/activites-postales',
      doc.id,
      'comptes'
    ]);
  }
}
