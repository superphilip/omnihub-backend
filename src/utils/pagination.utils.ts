import type { Request, Response, NextFunction } from 'express';
import type { PaginationParams, FilterParams } from '../utils/PaginationTypes.utils.js';

const DEFAULT_LIMIT = Number(process.env.PAGINATION_DEFAULT_LIMIT ?? 10);
const MAX_LIMIT = Number(process.env.PAGINATION_MAX_LIMIT ?? 100);

export function paginationMiddleware(req: Request, _res: Response, next: NextFunction) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  let limit = Math.max(1, Number(req.query.limit ?? DEFAULT_LIMIT));
  limit = Math.min(limit, MAX_LIMIT);

  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
  const order: PaginationParams['order'] = req.query.order === 'desc' ? 'desc' : 'asc';

  req.pagination = { page, limit, sort, order };

  const reserved = new Set(['page', 'limit', 'sort', 'order']);
  const filters: FilterParams = {};
  for (const key of Object.keys(req.query)) {
    if (!reserved.has(key) && typeof req.query[key] === 'string') {
      filters[key] = req.query[key] as string;
    }
  }
  req.filters = filters;

  next();
}

// Importante: asegúrate de que esta augmentación SOLO exista aquí (no dupliques en otros archivos)
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
      filters?: FilterParams;
    }
  }
}