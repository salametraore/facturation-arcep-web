import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { PageQuery, PageResult } from '../rcv-query';
import { applyPageQuery } from '../apply-page-query';

import { AppConfigService } from '../../core/config/app-config.service';
import { RecouvGroupeServices } from '../../shared/services/recouv-groupe.services';
import { RecouvGroupeMembreServices } from '../../shared/services/recouv-groupe-membre.services';
import { ClientService } from '../../shared/services/client.service';

@Injectable({ providedIn: 'root' })
export class RcvGroupesApi {
  private refreshGroupes$ = new BehaviorSubject<void>(undefined);
  private refreshMembres$ = new BehaviorSubject<void>(undefined);

  private groupes$ = this.refreshGroupes$.pipe(
    switchMap(() => this.grpSrv.getItems()),
    shareReplay(1)
  );

  private membres$ = this.refreshMembres$.pipe(
    switchMap(() => this.membreSrv.getItems()),
    shareReplay(1)
  );

  private clients$!: Observable<any[]>;

  constructor(
    private cfg: AppConfigService,
    private http: HttpClient,
    private grpSrv: RecouvGroupeServices,
    private membreSrv: RecouvGroupeMembreServices,
    private clientSrv: ClientService
  ) {
    this.clients$ = this.clientSrv.getItems().pipe(shareReplay(1));
  }

  // ========= GROUPES =========
  list(q: PageQuery): Observable<PageResult<any>> {
    return this.groupes$.pipe(
      map(all =>
        applyPageQuery(
          all,
          q,
          ['code', 'nom', 'description'],
          (g, f) => {
            if (f['actif'] !== null && f['actif'] !== undefined && f['actif'] !== '') {
              if ((g as any).actif !== f['actif']) return false;
            }
            if (f['type_groupe'] !== null && f['type_groupe'] !== undefined && f['type_groupe'] !== '') {
              if ((g as any).type_groupe !== f['type_groupe']) return false;
            }
            return true;
          }
        )
      )
    );
  }

  get(id: number): Observable<any> {
    return this.grpSrv.getItem(id);
  }

  create(dto: any): Observable<any> {
    return this.grpSrv.create(dto).pipe(tap(() => this.refreshGroupes$.next()));
  }

  update(id: number, dto: any): Observable<any> {
    return this.grpSrv.update(id, dto).pipe(tap(() => this.refreshGroupes$.next()));
  }

  patch(id: number, changes: any): Observable<any> {
    return this.grpSrv.patch(id, changes).pipe(tap(() => this.refreshGroupes$.next()));
  }

  delete(id: number): Observable<void> {
    return this.grpSrv.delete(id).pipe(tap(() => this.refreshGroupes$.next()));
  }

  // ========= MEMBRES =========
  listMembres(groupeId: number, q: PageQuery): Observable<PageResult<any>> {
    return combineLatest([this.membres$, this.clients$]).pipe(
      map(([membres, clients]) => {
        const onlyGroup = (membres || []).filter(m => Number((m as any).groupe) === Number(groupeId));

        const clientById = new Map<number, any>((clients || []).map(c => [Number(c.id), c]));
        const enriched = onlyGroup.map(m => ({
          ...m,
          client: clientById.get(Number((m as any).client_id))
        }));

        return applyPageQuery(
          enriched,
          q,
          [
            'client.denomination_sociale',
            'client.compte_comptable',
            'client.ifu',
            'client.rccm',
            'client.telephone',
            'client.email'
          ],
          (m, f) => {
            if (f['exclu'] !== null && f['exclu'] !== undefined && f['exclu'] !== '') {
              if ((m as any).exclu !== f['exclu']) return false;
            }
            return true;
          }
        );
      })
    );
  }

  addMembre(groupeId: number, clientId: number): Observable<any> {
    return this.membreSrv.create({
      groupe: Number(groupeId),
      client_id: Number(clientId),
      exclu: false,
      motif_override: null
    } as any).pipe(
      tap((res) => {
        console.log('addMembre response =', res);
        this.refreshMembres$.next();
      })
    );
  }

  toggleExclu(membreId: number, exclu: boolean, motif?: string): Observable<any> {
    return this.membreSrv.patch(membreId, {
      exclu,
      motif_override: exclu ? (motif || 'Exclusion manuelle') : null
    } as any).pipe(tap(() => this.refreshMembres$.next()));
  }

  removeMembre(membreId: number): Observable<void> {
    return this.membreSrv.delete(membreId).pipe(tap(() => this.refreshMembres$.next()));
  }

  // ========= PREVIEW DYNAMIQUE =========
  previewDynMembers(groupeId: number, q: PageQuery): Observable<PageResult<any>> {
    const url = `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/groupes/${groupeId}/preview-membres/`;

    return combineLatest([
      this.http.get<any[]>(url),
      this.clients$
    ]).pipe(
      map(([rows, clients]) => {
        const clientById = new Map<number, any>((clients || []).map(c => [Number(c.id), c]));
        const enriched = (rows || []).map(r => ({ ...r, client: clientById.get(Number(r.client_id)) }));

        return applyPageQuery(
          enriched,
          q,
          [
            'client.denomination_sociale',
            'client.compte_comptable',
            'client.ifu',
            'client.rccm',
            'client.telephone',
            'client.email'
          ]
        );
      })
    );
  }

  previewDynClientFactures(groupeId: number, clientId: number, q: PageQuery): Observable<PageResult<any>> {
    const url = `${this.cfg.baseUrl.replace(/\/$/, '')}/recouvrement/groupes/${groupeId}/preview-factures/${clientId}/`;

    return this.http.get<any[]>(url).pipe(
      map(all =>
        applyPageQuery(
          all || [],
          q,
          ['reference', 'objet', 'type_frais', 'etat']
        )
      )
    );
  }
}
