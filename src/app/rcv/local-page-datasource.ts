import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PageQuery, PageResult } from './rcv-query';

export type PageLoader<T> = (q: PageQuery) => PageResult<T>;

export class LocalPageDataSource<T> extends DataSource<T> {
  private rows$ = new BehaviorSubject<T[]>([]);
  private total$ = new BehaviorSubject<number>(0);
  private loading$ = new BehaviorSubject<boolean>(false);

  private search$ = new BehaviorSubject<string>('');
  private filters$ = new BehaviorSubject<Record<string, any>>({});

  constructor(
    private paginator: MatPaginator | null | undefined,
    private sort: MatSort | null | undefined,
    private loadPage: PageLoader<T>
  ) {
    super();
  }

  connect(): Observable<T[]> {
    const page$ = this.paginator?.page ? this.paginator.page.pipe(startWith(null)) : of(null);
    const sort$ = this.sort?.sortChange ? this.sort.sortChange.pipe(startWith(null)) : of(null);

    return combineLatest([
      page$,
      sort$,
      this.search$.pipe(startWith('')),
      this.filters$.pipe(startWith({}))
    ]).pipe(
      map(() => {
        this.loading$.next(true);

        const pageIndex = this.paginator?.pageIndex ?? 0;
        const pageSize = this.paginator?.pageSize ?? 25;

        const active = this.sort?.active;
        const direction = this.sort?.direction || 'asc';

        const q: PageQuery = {
          page: pageIndex + 1,
          pageSize,
          search: (this.search$.value || '').trim() || undefined,
          sort: active ? `${active},${direction}` : undefined,
          filters: this.filters$.value
        };

        const res = this.loadPage(q);
        this.rows$.next(res.items);
        this.total$.next(res.total);
        this.loading$.next(false);

        return res.items;
      })
    );
  }

  disconnect(): void {
    this.rows$.complete();
    this.total$.complete();
    this.loading$.complete();
    this.search$.complete();
    this.filters$.complete();
  }

  setSearch(value: string) {
    this.search$.next(value || '');
    this.paginator?.firstPage?.();
  }

  setFilters(filters: Record<string, any>) {
    this.filters$.next(filters || {});
    this.paginator?.firstPage?.();
  }

  totalCount$(): Observable<number> {
    return this.total$.asObservable();
  }

  loadingState$(): Observable<boolean> {
    return this.loading$.asObservable();
  }
}
