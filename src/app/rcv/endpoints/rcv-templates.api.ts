import {Injectable} from '@angular/core';
import {RcvStoreService} from '../rcv-store.service';
import {PageQuery, PageResult} from '../rcv-query';

@Injectable({providedIn: 'root'})
export class RcvTemplatesApi {
  private COL = 'templates';

  constructor(private store: RcvStoreService) {
  }

  list(q: PageQuery): PageResult<any> {
    return this.store.query<any>(this.COL, q, ['nom', 'canal']);
  }

  get(id: number) {
    return this.store.getById<any>(this.COL, id);
  }

  create(dto: any) {
    return this.store.create<any>(this.COL, dto);
  }

  update(id: number, patch: any) {
    return this.store.update<any>(this.COL, id, patch);
  }

  delete(id: number) {
    this.store.delete(this.COL, id);
  }
}
