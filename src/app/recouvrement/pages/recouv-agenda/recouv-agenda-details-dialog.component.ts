import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RcvAgendaApi } from '../../../rcv/endpoints/rcv-agenda.api';

type DialogData = { agendaId: number };

@Component({
  selector: 'recouv-agenda-details-dialog',
  templateUrl: './recouv-agenda-details-dialog.component.html',
  styleUrls: ['./recouv-agenda-details-dialog.component.scss']
})
export class RecouvAgendaDetailsDialogComponent implements OnInit {
  agenda: any;
  facturesLinks: any[] = [];
  logs: any[] = [];

  refs: string[] = [];
  refsResume = '';

  totalRecalc = 0;
  totalSeed: number | null = null;
  totalDelta = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<RecouvAgendaDetailsDialogComponent>,
    private api: RcvAgendaApi
  ) {}

  ngOnInit(): void {
    this.agenda = this.api.get(this.data.agendaId);
    if (!this.agenda) throw new Error(`Agenda item #${this.data.agendaId} introuvable`);

    // liens agenda ↔ factures (avec facture join)
    this.facturesLinks = this.api.getFactures(this.data.agendaId) || [];

    // logs (triés par api)
    this.logs = this.api.getLogs(this.data.agendaId) || [];

    // refs
    this.refs = this.facturesLinks
      .map(x => x?.facture?.reference)
      .filter(Boolean);

    this.refsResume = this.buildRefsResume(this.refs);

    // ✅ recalcul total = somme montant_restant (fallback montant)
    this.totalRecalc = this.facturesLinks.reduce((sum, x) => {
      const f = x?.facture;
      const r = (f?.montant_restant ?? f?.montant ?? 0);
      return sum + Number(r || 0);
    }, 0);

    // seed (dans ton seed: montant_total_portefeuille)
    this.totalSeed =
      this.agenda?.montant_total_portefeuille ??
        this.agenda?.montant_total_restant ??
          null;

    this.totalDelta =
      this.totalSeed != null ? (Number(this.totalSeed) - this.totalRecalc) : 0;
  }

  close() {
    this.ref.close();
  }

  /* ================= Helpers UI ================= */

  fmt(n: number): string {
    return Number(n || 0).toLocaleString('fr-FR');
  }

  /**
   * Seed utilise souvent date_prevue (YYYY-MM-DD)
   * et/ou date_planifiee (ISO datetime).
   */
  plannedDateRaw(): string {
    return String(this.agenda?.date_planifiee || this.agenda?.date_prevue || '');
  }

  fmtDate(value: any): string {
    const s = String(value || '').trim();
    if (!s) return '—';

    // si "YYYY-MM-DD" on garde tel quel
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // sinon on tente ISO datetime
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }

  plannedDate(): string {
    return this.fmtDate(this.agenda?.date_planifiee || this.agenda?.date_prevue || '');
  }

  clientLabel(): string {
    const c = this.agenda?.client; // enrichi si la liste a été chargée avant, sinon peut être absent
    return (
      c?.denomination_sociale ??
        c?.denomination ??
          c?.nom ??
            `Client #${this.agenda?.client_id}`
    );
  }

  private buildRefsResume(refs: string[]): string {
    if (!refs?.length) return '';
    const uniq = Array.from(new Set(refs));
    if (uniq.length <= 4) return uniq.join(', ');
    return `${uniq.slice(0, 4).join(', ')} … (+${uniq.length - 4})`;
  }
}
