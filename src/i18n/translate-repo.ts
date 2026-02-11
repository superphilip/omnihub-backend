
import type { PrismaClient } from '../generated/prisma/client.js';
import type { Locale } from './locale.js';


type FieldMap = Record<string, string>;

export async function fetchTranslationsMap(
  prisma: PrismaClient,
  resourceType: string,
  ids: readonly string[],
  fields: readonly string[],
  locale: Locale
): Promise<Map<string, FieldMap>> {
  if (ids.length === 0 || fields.length === 0) return new Map();
  const rows = await prisma.translation.findMany({
    where: { resourceType, resourceId: { in: ids as string[] }, field: { in: fields as string[] }, locale },
    select: { resourceId: true, field: true, text: true },
  });
  const map = new Map<string, FieldMap>();
  for (const r of rows) {
    const cur = map.get(r.resourceId) ?? {};
    cur[r.field] = r.text;
    map.set(r.resourceId, cur);
  }
  return map;
}

export function applyTranslations<T extends { id: string }>(
  items: readonly T[],
  tmap: Map<string, FieldMap>
): readonly T[] {
  return items.map((item) => {
    const t = tmap.get(item.id);
    return t ? { ...item, ...t } : item;
  });
}