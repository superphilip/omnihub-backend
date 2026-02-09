import type { Request, Response, NextFunction } from 'express';
import type { FilterParams, PaginationParams } from '../utils/PaginationTypes.utils.js';


export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  const page = Math.max(1, +(req.query.page ?? 1));
  const limit = Math.max(1, +(req.query.limit ?? 10));
  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  req.pagination = { page, limit, sort, order };

  // Extrae filtros/datos de búsqueda como objeto
  const filters: FilterParams = {};
  for (const key of Object.keys(req.query)) {
    // Solo filtros explícitos, puedes filtrar keys si lo prefieres
    if (!['page', 'limit', 'sort', 'order'].includes(key)) {
      filters[key] = req.query[key] as string;
    }
  }
  req.filters = filters;
  next();
}

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
      filters?: FilterParams;
    }
  }
}