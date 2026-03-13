import { PageQuery, PageResult } from './rcv-query';

function getVal(obj: any, path: string): any {
  return path.includes('.') ? path.split('.').reduce((a, k) => a?.[k], obj) : obj?.[path];
}

export function applyPageQuery<T>(
  all: T[],
  q: PageQuery,
  searchFields: string[],
  filterFn?: (item: T, filters: Record<string, any>) => boolean
): PageResult<T> {
  let items = [...(all || [])];
  const filters = q.filters || {};

  if (filterFn) items = items.filter(x => filterFn(x, filters));

  if (q.search?.trim()) {
    const s = q.search.trim().toLowerCase();
    items = items.filter(x => searchFields.some(f => String(getVal(x, f) ?? '').toLowerCase().includes(s)));
  }

  if (q.sort) {
    const [field, dir] = q.sort.split(',');
    const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
    items.sort((a: any, b: any) => {
      const av = getVal(a, field);
      const bv = getVal(b, field);
      return (av > bv ? 1 : av < bv ? -1 : 0) * d;
    });
  }

  const total = items.length;
  const pageSize = q.pageSize ?? 25;
  const page = q.page ?? 1;
  const start = (page - 1) * pageSize;

  return { items: items.slice(start, start + pageSize), page, pageSize, total };
}
