export type SortDir = 'asc' | 'desc';

export interface PageQuery {
  page?: number;      // 1..n
  pageSize?: number;  // 10/25/50...
  search?: string;
  sort?: string;      // ex: "priority,desc" ou "date_planifiee,asc"
  filters?: Record<string, any>; // ex: { actif: true, groupe_id: 1 }
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
