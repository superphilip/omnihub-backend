export type ColumnType = 'text' | 'date' | 'bool' | 'number';

export interface ApiColumnSpec {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  type?: ColumnType;
  format?: string;
}

export interface InferOptions {
  excludeKeys?: string[];              // ej: ['password', 'token']
  labelTransform?: (key: string) => string;
  defaultSortable?: boolean;           // default true
}

const DEFAULT_EXCLUDE = ['password', 'token', 'refreshToken'];

function defaultLabel(key: string): string {
  // Convierte snake/camel en Title Case
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return spaced
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function detectType(v: unknown, key: string): ColumnType {
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') return 'number';
  if (v instanceof Date) return 'date';
  if (typeof v === 'string') {
    // ISO/fecha común
    if (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{4}\/\d{2}\/\d{2}/.test(v)) return 'date';
    // IDs muy largos podrían seguir siendo text
    return 'text';
  }
  return 'text';
}

export function inferColumnsFromRows(rows: Record<string, unknown>[], options?: InferOptions): ApiColumnSpec[] {
  const opts: InferOptions = {
    excludeKeys: options?.excludeKeys ?? DEFAULT_EXCLUDE,
    labelTransform: options?.labelTransform ?? defaultLabel,
    defaultSortable: options?.defaultSortable ?? true,
  };

  const first = rows[0];
  if (!first) return [];

  const columns: ApiColumnSpec[] = [];
  for (const key of Object.keys(first)) {
    if (opts.excludeKeys!.includes(key)) continue;
    const value = (first as any)[key];
    // Evita objetos/arrays anidados (solo campos escalares)
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) continue;

    columns.push({
      key,
      label: opts.labelTransform!(key),
      sortable: opts.defaultSortable,
      visible: true,
      type: detectType(value, key),
      format: detectType(value, key) === 'date' ? 'YYYY/MM/DD' : undefined,
    });
  }
  return columns;
}

export function isValidSort(sort: string | undefined, columns: ApiColumnSpec[]): boolean {
  if (!sort) return true;
  const keys = new Set(columns.map(c => c.key));
  return keys.has(sort);
}