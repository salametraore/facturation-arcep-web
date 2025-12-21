import { Injectable } from '@angular/core';
import { RcvStoreService } from '../rcv-store.service';
import { PageQuery, PageResult } from '../rcv-query';

export type ExecPayload = { resultat: 'SUCCES' | 'ECHEC'; details?: string; canal_response?: any };

export type Canal = 'EMAIL' | 'SMS' | 'APPEL' | 'LETTRE';
export type AgendaStatut = 'A_FAIRE' | 'EN_COURS' | 'FAIT' | 'ECHOUE' | 'REPORTE' | 'ANNULE';

export interface ClientMini {
  id: number;
  denomination_sociale?: string;
  denomination?: string;
  nom?: string;
}

export interface PlanEtapeSeed {
  id: number;
  plan_action_id?: number;
  ordre?: number;
  type_action?: string;
  mode_execution?: string;
  delai_jours?: number;
  template_id?: number | null;
  actif?: boolean;
}

export interface TemplateSeed {
  id: number;
  code?: string;
  nom: string;
  canal: Canal | string; // seed legacy
  sujet?: string | null;
  contenu?: string;
  actif?: boolean;
  variables?: any;
}

export interface AgendaItemSeed {
  id: number;
  client_id: number;

  groupe_id?: number;
  declencheur_id?: number;

  plan_action_id?: number;
  plan_etape_id?: number | null;
  etape_id?: number | null; // seed parfois

  type_action?: string;
  mode_execution?: string;

  date_planifiee?: string; // canonical
  date_prevue?: string;    // seed legacy

  statut?: AgendaStatut | string;

  nb_factures?: number;
  montant_total_portefeuille?: number;
  montant_total_restant?: number;

  facture_plus_ancienne?: string;
  references_resume?: string;

  template_snapshot?: any;
}

export interface AgendaItemVM extends AgendaItemSeed {
  client: ClientMini | null;

  // normalisations
  plan_etape_id: number | null;
  date_planifiee: string;

  // enrichissement plan/template (pour preview)
  plan_etape?: PlanEtapeSeed | null;
  template_id?: number | null;
  template?: TemplateSeed | null;

  canal?: Canal | null;
  previewSubject?: string | null;
  previewBody?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RcvAgendaApi {
  private AGENDA = 'agendaItems';
  private LINKS = 'agendaItemFactures';
  private FACTURES = 'factures';
  private CLIENTS = 'clients';
  private LOGS = 'actionLogs';

  private ETAPES = 'planEtapes';
  private TEMPLATES = 'templates';

  constructor(private store: RcvStoreService) {}

  /** ✅ Options distinctes pour select "type action" */
  listTypeActions(): string[] {
    const all = (this.store.list<AgendaItemSeed>(this.AGENDA) || []);
    const set = new Set<string>();
    all.forEach(x => {
      const v = String(x?.type_action || '').trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  /** ✅ Normalise la date planifiée (seed: date_prevue) */
  private plannedDateRaw(x: any): string {
    return String(x?.date_planifiee || x?.date_prevue || '');
  }

  /** ✅ Construit un résumé refs (si non fourni en seed) */
  private buildRefsResume(agendaId: number, max = 4): string {
    const links = (this.store.list<any>(this.LINKS) || []).filter(l => l.agenda_item_id === agendaId);
    const factures = (this.store.list<any>(this.FACTURES) || []);

    const refs = links
      .map(l => factures.find(f => f.id === l.facture_id)?.reference)
      .filter(Boolean) as string[];

    if (!refs.length) return '';
    const head = refs.slice(0, max).join(', ');
    const more = refs.length > max ? ` +${refs.length - max}` : '';
    return head + more;
  }

  list(q: PageQuery): PageResult<AgendaItemVM> {
    const all = (this.store.list<AgendaItemSeed>(this.AGENDA) || []);
    const f = q.filters || {};

    // ✅ caches (1 seule fois)
    const clients = (this.store.list<ClientMini>(this.CLIENTS) || []);
    const etapes = (this.store.list<PlanEtapeSeed>(this.ETAPES) || []);
    const templates = (this.store.list<TemplateSeed>(this.TEMPLATES) || []).filter(t => t?.actif === true);

    const clientById = new Map<number, ClientMini>(clients.map(c => [c.id, c]));
    const etapeById = new Map<number, PlanEtapeSeed>(etapes.map(e => [e.id, e]));
    const templateById = new Map<number, TemplateSeed>(templates.map(t => [t.id, t]));

    // ✅ enrich + normalise
    let items: AgendaItemVM[] = all.map((x) => {
      const date_planifiee = this.plannedDateRaw(x);
      const plan_etape_id = (x?.plan_etape_id ?? x?.etape_id ?? null) as number | null;

      const client = clientById.get(x.client_id) || null;

      const etape = plan_etape_id ? etapeById.get(plan_etape_id) || null : null;
      const templateId = etape?.template_id ?? null;
      const template = templateId ? templateById.get(templateId) || null : null;

      const canal = (template?.canal || this.canalFromTypeAction(x.type_action || '') || null) as Canal | null;

      return {
        ...x,
        date_planifiee,
        plan_etape_id,
        client,

        references_resume: (x.references_resume && String(x.references_resume).trim().length > 0)
          ? x.references_resume
          : this.buildRefsResume(x.id),

        plan_etape: etape,
        template_id: templateId,
        template,

        canal,
        previewSubject: template?.sujet ?? null,
        previewBody: template?.contenu ?? null
      };
    });

    // ✅ filtres
    if (f['client_id']) items = items.filter(x => x.client_id === f['client_id']);
    if (f['statut']) items = items.filter(x => x.statut === f['statut']);
    if (f['type_action']) items = items.filter(x => x.type_action === f['type_action']);
    if (f['mode_execution']) items = items.filter(x => x.mode_execution === f['mode_execution']);

    if (f['dateFrom']) items = items.filter(x => String(x.date_planifiee) >= String(f['dateFrom']));
    if (f['dateTo']) items = items.filter(x => String(x.date_planifiee) <= String(f['dateTo']));

    // ✅ search
    if (q.search?.trim()) {
      const s = q.search.trim().toLowerCase();
      items = items.filter(x =>
        String(x.client?.denomination_sociale ?? x.client?.denomination ?? x.client?.nom ?? '').toLowerCase().includes(s) ||
        String(x.references_resume ?? '').toLowerCase().includes(s) ||
        String(x.previewSubject ?? '').toLowerCase().includes(s) ||
        String(x.previewBody ?? '').toLowerCase().includes(s)
      );
    }

    // ✅ sort (support MatSort "field,dir")
    if (q.sort?.trim()) {
      const [fieldRaw, dirRaw] = q.sort.split(',');
      const field = (fieldRaw || '').trim();
      const dir = (dirRaw || 'asc').trim().toLowerCase() === 'desc' ? -1 : 1;

      items = [...items].sort((a: any, b: any) => {
        const av = a?.[field];
        const bv = b?.[field];
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        return (String(av).localeCompare(String(bv))) * dir;
      });
    }

    // ✅ pagination
    const total = items.length;
    const pageSize = q.pageSize ?? 25;
    const page = q.page ?? 1;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }

  private canalFromTypeAction(typeAction: string): Canal | null {
    const t = String(typeAction || '').toUpperCase();
    if (t.includes('EMAIL')) return 'EMAIL';
    if (t.includes('SMS')) return 'SMS';
    if (t.includes('APPEL')) return 'APPEL';
    if (t.includes('COURRIER') || t.includes('LETTRE')) return 'LETTRE';
    return null;
  }

  get(id: number) {
    return this.store.getById<AgendaItemSeed>(this.AGENDA, id);
  }

  getFactures(agendaId: number): any[] {
    const links = (this.store.list<any>(this.LINKS) || []).filter(l => l.agenda_item_id === agendaId);
    const factures = (this.store.list<any>(this.FACTURES) || []);
    return links.map(l => ({ ...l, facture: factures.find(f => f.id === l.facture_id) || null }));
  }

  getLogs(agendaId: number): any[] {
    return (this.store.list<any>(this.LOGS) || [])
      .filter(l => l.agenda_item_id === agendaId)
      .sort((a, b) => String(b.date_execution).localeCompare(String(a.date_execution)));
  }

  execute(agendaId: number, payload: ExecPayload) {
    const statut = payload.resultat === 'SUCCES' ? 'FAIT' : 'ECHOUE';
    this.store.update<any>(this.AGENDA, agendaId, { statut });

    return this.store.create<any>(this.LOGS, {
      agenda_item_id: agendaId,
      date_execution: new Date().toISOString(),
      resultat: payload.resultat,
      details: payload.details ?? null,
      canal_response: payload.canal_response ?? null
    });
  }

  markEnCours(agendaId: number) {
    return this.store.update<any>(this.AGENDA, agendaId, { statut: 'EN_COURS' });
  }

  report(agendaId: number, newDateIso: string, motif?: string) {
    this.store.update<any>(this.AGENDA, agendaId, { statut: 'REPORTE', date_planifiee: newDateIso });

    return this.store.create<any>(this.LOGS, {
      agenda_item_id: agendaId,
      date_execution: new Date().toISOString(),
      resultat: 'REPORTE',
      details: motif ?? 'Report',
      canal_response: null
    });
  }
}
