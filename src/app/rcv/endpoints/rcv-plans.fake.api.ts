import { Injectable } from '@angular/core';
import { RcvStoreService } from '../rcv-store.service';
import { PageQuery, PageResult } from '../rcv-query';

@Injectable({ providedIn: 'root' })
export class RcvPlansApi {
  private PLANS = 'plans';
  private ETAPES = 'planEtapes';

  constructor(private store: RcvStoreService) {}

  list(q: PageQuery): PageResult<any> {
    return this.store.query<any>(this.PLANS, q, ['code','nom']);
  }
  get(id: number) { return this.store.getById<any>(this.PLANS, id); }
  create(dto: any) { return this.store.create<any>(this.PLANS, dto); }
  update(id: number, patch: any) { return this.store.update<any>(this.PLANS, id, patch); }
  delete(id: number) { this.store.delete(this.PLANS, id); }

  listEtapes(planId: number): any[] {
    return this.store.list<any>(this.ETAPES)
      .filter(e => e.plan_action_id === planId)
      .sort((a,b) => a.ordre - b.ordre);
  }
  addEtape(planId: number, dto: any) {
    const existing = this.listEtapes(planId);
    const ordre = dto.ordre ?? (existing.length ? Math.max(...existing.map(x => x.ordre)) + 1 : 1);
    return this.store.create<any>(this.ETAPES, { ...dto, plan_action_id: planId, ordre });
  }
  updateEtape(etapeId: number, patch: any) { return this.store.update<any>(this.ETAPES, etapeId, patch); }
  deleteEtape(etapeId: number) { this.store.delete(this.ETAPES, etapeId); }

  reorder(planId: number, orderedIds: number[]) {
    orderedIds.forEach((id, idx) => {
      this.store.update<any>(this.ETAPES, id, { ordre: idx + 1, plan_action_id: planId });
    });
  }
}
