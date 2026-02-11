import type { Request, Response, NextFunction } from 'express';
import { pickLocale } from '../i18n/locale.js';


declare global {
  namespace Express {
    interface Request {
      locale?: 'es' | 'en';
    }
  }
}

export function attachLocale(req: Request, _res: Response, next: NextFunction) {
  // Permite override por query param: ?lang=en
  const qp = (req.query?.lang ?? '') as string;
  const header = req.header('accept-language') ?? req.header('Accept-Language') ?? undefined;

  const locale = qp === 'en' || qp === 'es' ? (qp as 'es' | 'en') : pickLocale(header, 'es');
  req.locale = locale;
  next();
}