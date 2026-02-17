import type { Request, Response, NextFunction } from 'express';
import { pickLocale } from '../i18n/locale.js';

declare global {
  namespace Express {
    interface Request {
      locale?: 'es' | 'en'; // Agrega más si necesitas: 'fr', 'pt', etc.
    }
  }
}

// Middleware para establecer el locale en req.locale
export function attachLocale(req: Request, _res: Response, next: NextFunction) {
  // Permite override por query param (?lang=es o ?lang=en)
  const qp = typeof req.query?.lang === 'string' ? req.query.lang : '';
  // Header (case-insensitive)
  const header = req.header('accept-language') ?? req.header('Accept-Language') ?? undefined;

  // Solo acepta 'es' y 'en', pero puedes ampliar fácilmente
  const allowedLocales = ['es', 'en'];
  const locale =
    allowedLocales.includes(qp) ?
      qp as 'es' | 'en'
      : pickLocale(header, 'es');

  req.locale = allowedLocales.includes(locale) ? (locale as 'es' | 'en') : 'es';

  next();
}