import type { PaginationParams } from "./PaginationTypes.utils.js";



export function parsePagination(query: unknown): PaginationParams {
  const q = query as Record<string, string | undefined>;
  const page = Math.max(1, parseInt(q.page || '1', 10));
  const limit = Math.max(1, parseInt(q.limit || '10', 10));
  const sort = q.sort;
  const order = q.order === 'desc' ? 'desc' : 'asc';
  return { page, limit, sort, order };
}