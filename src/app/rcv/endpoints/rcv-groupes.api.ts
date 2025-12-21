//rcv-groupes.api.ts

import { Injectable } from '@angular/core';
import { RcvStoreService } from '../rcv-store.service';
import { PageQuery, PageResult } from '../rcv-query';


@Injectable({ providedIn: 'root' })
export class RcvGroupesApi {
  private COL = 'groupes';
  private MEMBRES = 'groupeMembres';
  private CLIENTS = 'clients';

  constructor(private store: RcvStoreService) {}

  list(q: PageQuery): PageResult<any> {
    return this.store.query<any>(this.COL, q, ['code','nom','description']);
  }
  get(id: number) { return this.store.getById<any>(this.COL, id); }
  create(dto: any) { return this.store.create<any>(this.COL, dto); }
  update(id: number, patch: any) { return this.store.update<any>(this.COL, id, patch); }
  delete(id: number) { this.store.delete(this.COL, id); }

  listMembres(groupeId: number, q: PageQuery): PageResult<any> {
    const all = this.store.list<any>(this.MEMBRES).filter(m => m.groupe_id === groupeId);

    // enrich client
    const clients = this.store.list<any>(this.CLIENTS);
    const enriched = all.map(m => ({ ...m, client: clients.find(c => c.id === m.client_id) }));

    // apply basic query manually (search on client fields)
    const tmpKey = '__tmp_membres';
    // trick: query expects a collection; we can just query in-memory by calling store.query on temp array if you want.
    // here: minimal inline
    let items = enriched;

    if (q.filters?.['exclu'] !== undefined && q.filters['exclu'] !== null && q.filters['exclu'] !== '') {
      items = items.filter(x => x.exclu === q.filters!['exclu']);
    }
    if (q.search?.trim()) {
      const s = q.search.trim().toLowerCase();
      items = items.filter(x =>
        String(x.client?.code ?? '').toLowerCase().includes(s) ||
        String(x.client?.denomination ?? '').toLowerCase().includes(s)
      );
    }
    // sort
    if (q.sort) {
      const [field, dir] = q.sort.split(',');
      const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      items.sort((a, b) => (a?.[field] > b?.[field] ? 1 : a?.[field] < b?.[field] ? -1 : 0) * d);
    }

    const total = items.length;
    const pageSize = q.pageSize ?? 25;
    const page = q.page ?? 1;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }

  addMembre(groupeId: number, clientId: number) {
    const exists = this.store.list<any>(this.MEMBRES)
      .some(m => m.groupe_id === groupeId && m.client_id === clientId);
    if (exists) return null; // ou throw / ou update exclu=false

    return this.store.create<any>(this.MEMBRES, {
      groupe_id: groupeId,
      client_id: clientId,
      exclu: false,
      motif_override: null
    });
  }

  toggleExclu(membreId: number, exclu: boolean, motif?: string) {
    return this.store.update<any>(this.MEMBRES, membreId, {
      exclu,
      motif_override: exclu ? (motif || 'Exclusion manuelle') : null
    });
  }

  removeMembre(membreId: number) {
    this.store.delete(this.MEMBRES, membreId);
  }

  previewDynMembers(groupeId: number, q: PageQuery): PageResult<any> {
    const declencheurs = this.store.list<any>('declencheurs')
      .filter(d => d.groupe_id === groupeId && d.actif);

    const clients = this.store.list<any>('clients');
    const factures = this.store.list<any>('factures');

    const clientById = new Map<number, any>(clients.map(c => [c.id, c]));

    const today = new Date();
    const daysLate = (dateIso: string) => {
      const ech = new Date(dateIso);
      const diff = Math.floor((today.getTime() - ech.getTime()) / 86400000);
      return diff;
    };

    // union des factures éligibles (déclencheurs multiples)
    const eligibleFactures: any[] = [];

    for (const d of declencheurs) {
      const crit = d.criteres || {};
      let items = factures.filter(f =>
        (f.statut === 'IMPAYE' || f.statut === 'PARTIELLE') &&
        (f.montant_restant ?? 0) > 0
      );

      if (crit.montant_min != null) {
        items = items.filter(f => (f.montant_restant ?? 0) >= crit.montant_min);
      }
      if (crit.produit_code?.length) {
        items = items.filter(f => crit.produit_code.includes(f.produit_code));
      }
      if (crit.type_client?.length) {
        items = items.filter(f => crit.type_client.includes(clientById.get(f.client_id)?.type_client));
      }
      if (crit.jours_apres_echeance_min != null) {
        items = items.filter(f => daysLate(f.date_echeance) >= crit.jours_apres_echeance_min);
      }

      eligibleFactures.push(...items);
    }

    // group by client
    const agg = new Map<number, { client: any; nb_factures: number; montant_total: number }>();

    for (const f of eligibleFactures) {
      const c = clientById.get(f.client_id);
      if (!c) continue;

      const a = agg.get(f.client_id) ?? { client: c, nb_factures: 0, montant_total: 0 };
      a.nb_factures += 1;
      a.montant_total += (f.montant_restant ?? 0);
      agg.set(f.client_id, a);
    }

    let items = Array.from(agg.values());

    // search
    if (q.search?.trim()) {
      const s = q.search.trim().toLowerCase();
      items = items.filter(x =>
        String(x.client?.code ?? '').toLowerCase().includes(s) ||
        String(x.client?.denomination ?? '').toLowerCase().includes(s)
      );
    }

    // sort
    if (q.sort) {
      const [field, dir] = q.sort.split(',');
      const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;

      items.sort((a: any, b: any) => {
        const av = field.startsWith('client.') ? a.client?.[field.split('.')[1]] : a[field];
        const bv = field.startsWith('client.') ? b.client?.[field.split('.')[1]] : b[field];
        return (av > bv ? 1 : av < bv ? -1 : 0) * d;
      });
    }

    const total = items.length;
    const pageSize = q.pageSize ?? 25;
    const page = q.page ?? 1;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }

  // Dans RcvGroupesApi (rcv-groupes.api.ts)
  previewDynClientFactures(groupeId: number, clientId: number, q: PageQuery): PageResult<any> {
    const declencheurs = this.store.list<any>('declencheurs')
      .filter(d => d.groupe_id === groupeId && d.actif);

    const clients = this.store.list<any>('clients');
    const factures = this.store.list<any>('factures');

    const client = clients.find(c => c.id === clientId);
    if (!client) return { items: [], page: 1, pageSize: q.pageSize ?? 25, total: 0 };

    const today = new Date();
    const daysLate = (isoDate: string) => Math.floor((today.getTime() - new Date(isoDate).getTime()) / 86400000);

    // base: factures impayées/partielles du client
    const base = factures.filter(f =>
      f.client_id === clientId &&
      (f.statut === 'IMPAYE' || f.statut === 'PARTIELLE') &&
      (f.montant_restant ?? 0) > 0
    );

    // union des factures éligibles via déclencheurs
    const eligible = new Map<number, any>(); // key facture_id

    for (const d of declencheurs) {
      const crit = d.criteres || {};
      let items = [...base];

      if (crit.montant_min != null) items = items.filter(f => (f.montant_restant ?? 0) >= crit.montant_min);
      if (crit.produit_code?.length) items = items.filter(f => crit.produit_code.includes(f.produit_code));
      if (crit.type_client?.length) items = items.filter(_ => crit.type_client.includes(client.type_client));
      if (crit.jours_apres_echeance_min != null) items = items.filter(f => daysLate(f.date_echeance) >= crit.jours_apres_echeance_min);

      for (const f of items) eligible.set(f.id, f);
    }

    let items = Array.from(eligible.values());

    // search
    if (q.search?.trim()) {
      const s = q.search.trim().toLowerCase();
      items = items.filter(f =>
        String(f.reference ?? '').toLowerCase().includes(s) ||
        String(f.objet ?? '').toLowerCase().includes(s) ||
        String(f.produit_code ?? '').toLowerCase().includes(s)
      );
    }

    // sort
    if (q.sort) {
      const [field, dir] = q.sort.split(',');
      const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      items.sort((a, b) => (a?.[field] > b?.[field] ? 1 : a?.[field] < b?.[field] ? -1 : 0) * d);
    }

    const total = items.length;
    const pageSize = q.pageSize ?? 10;
    const page = q.page ?? 1;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }

}
