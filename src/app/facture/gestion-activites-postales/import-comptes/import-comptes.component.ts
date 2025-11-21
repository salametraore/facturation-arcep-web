import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
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
import { ActivatedRoute, Router } from "@angular/router";
import { ActivitesPostalesService } from "../../../shared/services/activites-postales.service";


@Component({
  selector: 'app-import-comptes',
  templateUrl: './import-comptes.component.html',
  styleUrls: ['./import-comptes.component.scss']  // ⚠️ styleUrls (avec s)
})
export class ImportComptesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'selectionne',
    'statut',      // colonne statut
    'numero',
    'libelle',
    'credit'
  ];

  dataSource = new MatTableDataSource<CompteImport>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // petit header en haut de page
  docNom = '';
  docEntreprise = '';
  docAnnee = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflow: ActivitesPostalesService
  ) {}

  /** id du document dans l’URL */
  get docId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    const doc = this.workflow.getDocument(this.docId);
    if (doc) {
      this.docNom = doc.nomFichier;
      this.docEntreprise = doc.ClientNom;
      this.docAnnee = doc.anneeFiscale;
    }

    this.dataSource.data = this.workflow.getComptesImport(this.docId);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    // filtre simple sur numéro + libellé
    this.dataSource.filterPredicate = (row, filter) =>
      (row.numero + ' ' + row.libelle).toLowerCase().includes(filter);
  }

  /* ========= Recherche ========= */

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  /* ========= Sélection & totaux ========= */

  get allSelected(): boolean {
    const data = this.dataSource.filteredData.length
      ? this.dataSource.filteredData
      : this.dataSource.data;
    return data.length > 0 && data.every(c => c.selectionne);
  }

  toggleAllSelection(): void {
    const target = !this.allSelected;
    const data = this.dataSource.data.map(c => ({
      ...c,
      selectionne: target
    }));
    this.dataSource.data = data;
  }

  get totalDebit(): number {
    return this.dataSource.data.reduce((sum, c) => sum + (c.debit || 0), 0);
  }

  get totalCredit(): number {
    return this.dataSource.data.reduce((sum, c) => sum + (c.credit || 0), 0);
  }

  get totalDebitSelectionne(): number {
    return this.dataSource.data
      .filter(c => c.selectionne)
      .reduce((sum, c) => sum + (c.debit || 0), 0);
  }

  get totalCreditSelectionne(): number {
    return this.dataSource.data
      .filter(c => c.selectionne)
      .reduce((sum, c) => sum + (c.credit || 0), 0);
  }

  /* ========= Navigation ========= */

  goPrev(): void {
    this.router.navigate(['/facture/activites-postales']);
  }

  goNext(): void {
    // on sauvegarde les comptes cochés dans le workflow
    this.workflow.setComptesImport(this.docId, this.dataSource.data);
    this.router.navigate([
      '/facture/activites-postales',
      this.docId,
      'traitement'
    ]);
  }
}
