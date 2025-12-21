import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of } from 'rxjs';

import { LocalPageDataSource } from '../../../rcv/local-page-datasource';
import { PageResult } from '../../../rcv/rcv-query';
import { RcvAgendaApi } from '../../../rcv/endpoints/rcv-agenda.api';

import { RecouvAgendaDetailsDialogComponent } from './recouv-agenda-details-dialog.component';

type AgendaStatut = 'A_FAIRE' | 'EN_COURS' | 'FAIT' | 'ECHOUE' | 'REPORTE' | 'ANNULE';
type ModeExecution = 'AUTO' | 'SEMI_AUTO' | 'MANU' | 'MANUEL';

@Component({
  selector: 'recouv-agenda',
  templateUrl: './recouv-agenda.component.html',
  styleUrls: ['./recouv-agenda.component.scss']
})
export class RecouvAgendaComponent implements AfterViewInit {
  // ✅ DOIT matcher les matColumnDef du HTML
/*  displayedColumns = [
    'client',
    'type_action',
    'date_planifiee',
    'statut',
    'mode_execution',
    'portefeuille',
    'nb_factures',
    'preview',
    'preview_toggle',
    'actions'
  ];*/

  displayedColumns = [
    'client',
    'type_action',
    'date_planifiee',
    'statut',
    'mode_execution',
    'portefeuille',
    'nb_factures',
    'preview_toggle',
    'actions'
  ];

  dataSource!: LocalPageDataSource<any>;
  total$: Observable<number> = of(0);
  loading$: Observable<boolean> = of(false);

  search = '';

  // ✅ filtres
  clientId: number | null = null;
  statut: AgendaStatut | null = null;
  typeAction: string | null = null;
  modeExecution: ModeExecution | null = null;
  dateFrom: string | null = null;
  dateTo: string | null = null;

  // ✅ options selects
  readonly statuts: AgendaStatut[] = ['A_FAIRE', 'EN_COURS', 'FAIT', 'ECHOUE', 'REPORTE', 'ANNULE'];
  readonly modes: ModeExecution[] = ['AUTO', 'SEMI_AUTO', 'MANU', 'MANUEL'];

  typeActionsOptions: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ✅ preview pliable (par id)
  private previewOpen = new Set<number>();

  constructor(
    private api: RcvAgendaApi,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.typeActionsOptions = ['APPEL','COURRIER','EMAIL','SMS'];
  }
  
  ngAfterViewInit(): void {
    this.dataSource = new LocalPageDataSource<any>(
      this.paginator,
      this.sort,
      (q) => this.api.list(q) as PageResult<any>
    );

    this.total$ = this.dataSource.totalCount$();
    this.loading$ = this.dataSource.loadingState$();

    // tri par défaut
    this.sort.active = 'date_planifiee';
    this.sort.direction = 'asc';

   /* // ✅ options Type action
    this.typeActionsOptions = this.api.listTypeActions?.() ?? [];*/

    this.applyFilters();
  }

  applySearch() {
    this.dataSource.setSearch(this.search);
  }

  applyFilters() {
    this.dataSource.setFilters({
      client_id: this.clientId ?? null,
      statut: this.statut ?? null,
      type_action: this.typeAction ?? null,
      mode_execution: this.modeExecution ?? null,
      dateFrom: this.dateFrom ?? null,
      dateTo: this.dateTo ?? null
    });
  }

  clear() {
    this.search = '';
    this.clientId = null;
    this.statut = null;
    this.typeAction = null;
    this.modeExecution = null;
    this.dateFrom = null;
    this.dateTo = null;

    this.dataSource.setSearch('');
    this.dataSource.setFilters({});
  }

  // ===== Helpers affichage =====

  clientLabel(row: any): string {
    const c = row?.client;
    return c?.denomination_sociale ?? c?.denomination ?? c?.nom ?? `Client #${row?.client_id}`;
  }

  plannedDate(row: any): string {
    if (!row?.date_planifiee) return '—';
    const d = new Date(row.date_planifiee);
    if (isNaN(d.getTime())) return String(row.date_planifiee);
    return new Intl.DateTimeFormat('fr-FR').format(d); // dd/MM/yyyy
  }

  fmt(n: number): string {
    return Number(n || 0).toLocaleString('fr-FR');
  }

  montantTotal(row: any): number {
    return Number(row?.montant_total_portefeuille ?? row?.montant_total_restant ?? 0);
  }

  montantLabel(row: any): string {
    return `${this.fmt(this.montantTotal(row))} FCFA`;
  }

  nbFactures(row: any): number {
    return Number(row?.nb_factures ?? row?.nb_factures_portefeuille ?? 0);
  }

  portefeuilleTooltip(row: any): string {
    const lines: string[] = [];
    const nb = this.nbFactures(row);
    const mt = this.montantTotal(row);

    if (nb) lines.push(`Nb factures: ${nb}`);
    if (mt) lines.push(`Montant total: ${this.fmt(mt)} FCFA`);
    if (row?.references_resume) lines.push(`Réfs: ${row.references_resume}`);

    return lines.length ? lines.join('\n') : 'Portefeuille';
  }

  openDetails(row: any) {
    this.dialog.open(RecouvAgendaDetailsDialogComponent, {
      width: '980px',
      maxWidth: '98vw',
      data: { agendaId: row.id }
    });
  }

  trackById(_: number, r: any) {
    return r?.id;
  }

  // =====================
  // Aperçu (message)
  // =====================

  togglePreview(row: any) {
    const id = Number(row?.id);
    if (!id) return;

    if (this.previewOpen.has(id)) this.previewOpen.delete(id);
    else this.previewOpen.add(id);
  }

  isPreviewOpen(row: any): boolean {
    const id = Number(row?.id);
    return !!id && this.previewOpen.has(id);
  }

  /** template_snapshot (si existe) sinon previewBody (API enrich) */
  hasPreview(row: any): boolean {
    const snap = row?.template_snapshot;

    if (snap) {
      if (typeof snap === 'string') return snap.trim().length > 0;
      const txt = snap?.contenu ?? snap?.body ?? snap?.text ?? snap?.message ?? null;
      return !!(txt && String(txt).trim().length > 0);
    }

    return !!(row?.previewBody && String(row.previewBody).trim().length > 0);
  }

  previewSubject(row: any): string | null {
    const snap = row?.template_snapshot;
    const s = snap?.sujet ?? snap?.subject ?? null;
    const snapSubject = (s && String(s).trim().length > 0) ? String(s) : null;

    if (snapSubject) return snapSubject;

    const apiSubject = row?.previewSubject ?? null;
    return apiSubject ? String(apiSubject) : null;
  }

  /** Texte complet pour l’aperçu étendu (ligne expand) */
  extractSnapshotTextPublic(row: any): string {
    const snap = row?.template_snapshot;

    if (snap) {
      if (typeof snap === 'string') return snap;

      const body =
        snap?.contenu ??
          snap?.body ??
            snap?.text ??
              snap?.message ??
                '';

      return String(body || '');
    }

    // fallback API
    return String(row?.previewBody ?? '');
  }

  canalLabel(row: any): string {
    // priorité: snapshot.canal, sinon row.canal (API enrich), sinon fallback type_action
    const c = String(
      row?.template_snapshot?.canal ??
        row?.canal ??
          this.canalFromTypeAction(row?.type_action) ??
            ''
    ).toUpperCase();

    if (!c) return '—';
    if (c === 'LETTRE') return 'COURRIER'; // legacy
    return c;
  }

  private canalFromTypeAction(typeAction: any): 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE' | null {
    const t = String(typeAction || '').toUpperCase();
    if (t.includes('EMAIL')) return 'EMAIL';
    if (t.includes('SMS')) return 'SMS';
    if (t.includes('APPEL')) return 'APPEL';
    if (t.includes('COURRIER') || t.includes('LETTRE')) return 'LETTRE';
    return null;
  }

  previewShort(row: any, max = 140): string {
    const raw = this.extractSnapshotTextPublic(row).replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    return raw.length > max ? raw.slice(0, max - 1) + '…' : raw;
  }

  previewTooltip(row: any): string {
    if (!this.hasPreview(row)) return 'Aucun aperçu (ouvrir “Détails”)';

    const subject = this.previewSubject(row);
    const head: string[] = [`Canal: ${this.canalLabel(row)}`];

    if (subject) head.push(`Sujet: ${subject}`);

    const body = this.previewShort(row, 260);
    if (body) head.push(body);

    return head.join('\n');
  }
}
