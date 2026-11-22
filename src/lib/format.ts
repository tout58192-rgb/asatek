import type { Lang } from './i18n';

/**
 * Formats PKR amounts using Western digits in both EN and UR.
 * Example: 1250 -> "PKR 1,250"
 */
export function formatPKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return 'PKR 0';
  }
  const num = Number(amount);
  const hasFraction = Math.abs(num - Math.round(num)) > 0.001;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(num);
  return `PKR ${formatted}`;
}

export function formatDate(isoString: string, lang: Lang = 'en'): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat(lang === 'ur' ? 'en-PK' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getErrorMessage(err: unknown, fallback = 'Request failed'): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message?: unknown }).message ?? '').trim();
    if (msg) return msg;
  }
  return fallback;
}
