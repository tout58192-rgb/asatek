import type {
  InquiryStatus,
  InquiryWithItems,
  SalesSummaryDailyPoint,
  SalesSummaryMonthlyPoint,
} from '../types/db';
import type { Lang } from './i18n';

export type OrderTimelineStep = 0 | 1 | 2 | 3;

/**
 * Maps inquiry status to the 4 customer-facing timeline stages:
 * 0 = Received (new/contacted/closed), 1 = Confirmed, 2 = Dispatched, 3 = Completed.
 * Returns -1 when status === 'skipped'.
 */
export function getOrderTimelineStep(status: InquiryStatus): number {
  switch (status) {
    case 'new':
    case 'contacted':
    case 'closed':
      return 0;
    case 'confirmed':
      return 1;
    case 'dispatched':
      return 2;
    case 'completed':
      return 3;
    case 'skipped':
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

export function isRevenueStatus(status: InquiryStatus): boolean {
  return (
    status === 'confirmed' ||
    status === 'dispatched' ||
    status === 'completed'
  );
}

export function getInquiryTotalAmount(inquiry: InquiryWithItems): number {
  if (
    inquiry.total_amount !== undefined &&
    inquiry.total_amount !== null &&
    !Number.isNaN(Number(inquiry.total_amount))
  ) {
    return Number(inquiry.total_amount);
  }
  return inquiry.items.reduce(
    (sum, item) => sum + Number(item.unit_price ?? 0) * item.quantity,
    0,
  );
}

export function formatBuyerReplyDigits(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (trimmed === '-' || trimmed === '—') return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10 || /^0+$/.test(digits)) return null;
  return digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
}

export function buildBuyerStatusWhatsAppMessage(params: {
  reference: string;
  status: InquiryStatus;
  skipReason?: string | null;
  lang: Lang;
}): string {
  const { reference, status, skipReason, lang } = params;
  if (lang === 'ur') {
    switch (status) {
      case 'confirmed':
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} کنفرم ہو گیا ہے۔`;
      case 'dispatched':
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} روانہ (ڈسپیچ) کر دیا گیا ہے۔`;
      case 'completed':
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} مکمل ہو چکا ہے۔ ایساٹیک کا انتخاب کرنے کا شکریہ۔`;
      case 'skipped':
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} اسکپ کر دیا گیا ہے۔${skipReason ? ` وجہ: ${skipReason}` : ''}`;
      case 'cancelled':
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} منسوخ کر دیا گیا ہے۔${skipReason ? ` وجہ: ${skipReason}` : ''}`;
      case 'contacted':
        return `السلام علیکم! آپ کے ایساٹیک آرڈر ${reference} کے حوالے سے ہماری ٹیم جلد رابطہ کر رہی ہے۔`;
      default:
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} موصول ہو چکا ہے اور اس پر کارروائی جاری ہے۔`;
    }
  }

  switch (status) {
    case 'confirmed':
      return `Assalam o Alaikum, your ASATEK order ${reference} is confirmed.`;
    case 'dispatched':
      return `Assalam o Alaikum, your ASATEK order ${reference} has been dispatched.`;
    case 'completed':
      return `Assalam o Alaikum, your ASATEK order ${reference} is completed. Thank you for choosing ASATEK.`;
    case 'skipped':
      return `Assalam o Alaikum, your ASATEK order ${reference} was skipped.${skipReason ? ` Reason: ${skipReason}` : ''}`;
    case 'cancelled':
      return `Assalam o Alaikum, your ASATEK order ${reference} was cancelled.${skipReason ? ` Reason: ${skipReason}` : ''}`;
    case 'contacted':
      return `Assalam o Alaikum, regarding your ASATEK order ${reference}:`;
    default:
      return `Assalam o Alaikum, we have received your ASATEK order ${reference} and it is currently under review.`;
  }
}

export type DateRangePreset =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPresetDateRange(
  preset: Exclude<DateRangePreset, 'custom'>,
  now = new Date(),
): { from: string; to: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = toLocalIsoDate(today);

  if (preset === 'today') {
    return { from: to, to };
  }
  if (preset === 'last_7_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { from: toLocalIsoDate(start), to };
  }
  if (preset === 'last_30_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { from: toLocalIsoDate(start), to };
  }
  if (preset === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toLocalIsoDate(start), to };
  }
  // last_month
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  return { from: toLocalIsoDate(start), to: toLocalIsoDate(end) };
}

export function findBestDay(
  daily: SalesSummaryDailyPoint[],
): SalesSummaryDailyPoint | null {
  if (!daily || daily.length === 0) return null;
  let best = daily[0];
  for (const pt of daily) {
    if (pt.revenue > best.revenue) best = pt;
  }
  return best.revenue > 0 || best.orders > 0 ? best : null;
}

export function findBestMonth(
  monthly: SalesSummaryMonthlyPoint[],
): SalesSummaryMonthlyPoint | null {
  if (!monthly || monthly.length === 0) return null;
  let best = monthly[0];
  for (const pt of monthly) {
    if (pt.revenue > best.revenue) best = pt;
  }
  return best.revenue > 0 || best.orders > 0 ? best : null;
}

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildOrdersCsv(inquiries: InquiryWithItems[]): string {
  const headers = [
    'Reference',
    'Date',
    'Type',
    'Channel',
    'Status',
    'Buyer Name',
    'Phone',
    'City',
    'Business Name',
    'Items',
    'Total (PKR)',
    'Skip Reason',
    'Admin Note',
  ];

  const rows = inquiries.map((inq) => {
    const itemsSummary = inq.items
      .map(
        (item) =>
          `${item.product_name}${item.sku ? ` (${item.sku})` : ''} x${item.quantity}${item.unit_price !== null ? ` @ ${item.unit_price}` : ''}`,
      )
      .join(' | ');
    const total = getInquiryTotalAmount(inq);
    return [
      inq.reference,
      inq.created_at,
      inq.type,
      inq.channel,
      inq.status,
      inq.name,
      inq.phone,
      inq.city ?? '',
      inq.business_name ?? '',
      itemsSummary,
      total,
      inq.skip_reason ?? '',
      inq.admin_note ?? '',
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatShortPKR(value: number): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1_000_000) {
    const m = num / 1_000_000;
    return `${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    const k = num / 1_000;
    return `${Number.isInteger(k) || Math.abs(k) >= 100 ? Math.round(k) : k.toFixed(1)}K`;
  }
  return String(Math.round(num));
}

export function formatShortChartDate(isoDate: string): string {
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length !== 3) return isoDate;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const monthLabel = MONTH_SHORT_NAMES[monthIdx] ?? parts[1];
  return `${day} ${monthLabel}`;
}

export function getTodayLocalIso(now = new Date()): string {
  return toLocalIsoDate(now);
}

/**
 * Normalizes daily sales points across [from, to] (zero-filling gaps for ranges
 * up to 62 days so the Sales by Date area curve renders continuously and includes
 * today's marker if today falls in range).
 */
export function buildContinuousDailySeries(
  daily: SalesSummaryDailyPoint[],
  from: string,
  to: string,
  todayIso = toLocalIsoDate(new Date()),
): SalesSummaryDailyPoint[] {
  const byDate = new Map<string, SalesSummaryDailyPoint>();
  for (const pt of daily) {
    const key = pt.date.slice(0, 10);
    const existing = byDate.get(key);
    if (existing) {
      existing.orders += Number(pt.orders) || 0;
      existing.revenue += Number(pt.revenue) || 0;
    } else {
      byDate.set(key, {
        date: key,
        orders: Number(pt.orders) || 0,
        revenue: Number(pt.revenue) || 0,
      });
    }
  }

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  const dayDiff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  if (dayDiff <= 62) {
    const result: SalesSummaryDailyPoint[] = [];
    const cursor = new Date(start);
    for (let i = 0; i < dayDiff; i += 1) {
      const iso = toLocalIsoDate(cursor);
      result.push(byDate.get(iso) ?? { date: iso, orders: 0, revenue: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  if (todayIso >= from && todayIso <= to && !byDate.has(todayIso)) {
    byDate.set(todayIso, { date: todayIso, orders: 0, revenue: 0 });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type MenuNavKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

export function getNextMenuIndex(
  currentIndex: number,
  key: MenuNavKey,
  itemCount: number,
): number {
  if (itemCount <= 0) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (currentIndex < 0 || currentIndex >= itemCount) {
    return key === 'ArrowDown' ? 0 : itemCount - 1;
  }
  return key === 'ArrowDown'
    ? (currentIndex + 1) % itemCount
    : (currentIndex - 1 + itemCount) % itemCount;
}
