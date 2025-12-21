import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PageQuery } from './rcv-query';

export function buildPageQuery(
  paginator: MatPaginator,
  sort: MatSort,
  search?: string,
  filters?: Record<string, any>
): PageQuery {
  const page = (paginator?.pageIndex ?? 0) + 1;
  const pageSize = paginator?.pageSize ?? 25;

  let sortStr: string | undefined;
  if (sort?.active) {
    sortStr = `${sort.active},${(sort.direction || 'asc')}`;
  }

  return {
    page,
    pageSize,
    search: search?.trim() || undefined,
    sort: sortStr,
    filters: filters || undefined
  };
}
