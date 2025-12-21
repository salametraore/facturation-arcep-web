import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
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
    private paginator: MatPaginator,
    private sort: MatSort,
    private loadPage: PageLoader<T>
  ) {
    super();
  }

  connect(): Observable<T[]> {
    return combineLatest([
      this.paginator.page.pipe(startWith(null)),
      this.sort.sortChange.pipe(startWith(null)),
      this.search$.pipe(startWith('')),
      this.filters$.pipe(startWith({}))
    ]).pipe(
      map(() => {
        this.loading$.next(true);

        const q: PageQuery = {
          page: (this.paginator.pageIndex ?? 0) + 1,
          pageSize: this.paginator.pageSize ?? 25,
          search: (this.search$.value || '').trim() || undefined,
          sort: this.sort.active ? `${this.sort.active},${this.sort.direction || 'asc'}` : undefined,
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
    this.paginator.firstPage();
  }

  setFilters(filters: Record<string, any>) {
    this.filters$.next(filters || {});
    this.paginator.firstPage();
  }

  totalCount$(): Observable<number> {
    return this.total$.asObservable();
  }

  loadingState$(): Observable<boolean> {
    return this.loading$.asObservable();
  }
}
