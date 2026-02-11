export type Locale = 'es' | 'en';
const SUPPORTED: ReadonlySet<Locale> = new Set(['es', 'en']);

export function pickLocale(header?: string, fallback: Locale = 'es'): Locale {
  if (!header) return fallback;

  // Normaliza en minúsculas, separa por coma y limpia tokens vacíos
  const tokens = header.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  // Parse seguro: evita undefined y respeta q-weights
  const weighted = tokens
    .map(token => {
      const semi = token.indexOf(';');
      const langPart = semi >= 0 ? token.slice(0, semi) : token;   // ej: "es-ES"
      const qPart   = semi >= 0 ? token.slice(semi + 1) : '';      // ej: "q=0.9"
      const base    = (langPart.split('-')[0] ?? '').trim();       // ej: "es"
      const qMatch  = /q=([0-9.]+)/.exec(qPart);
      const q       = qMatch ? Number(qMatch[1]) : 1;
      return { base, q };
    })
    .filter(p => p.base.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { base } of weighted) {
    const candidate = base as Locale;
    if (SUPPORTED.has(candidate)) return candidate;
  }
  return fallback;
}

export function pickLocaleFromRequest(
  getHeader: (name: string) => string | undefined,
  fallback: Locale = 'es'
): Locale {
  const header = getHeader('accept-language') ?? getHeader('Accept-Language');
  return pickLocale(header, fallback);
}