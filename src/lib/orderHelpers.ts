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
        return `السلام علیکم! آپ کا ایساٹیک آرڈر ${reference} منسوخ / روک دیا گیا ہے۔${skipReason ? ` وجہ: ${skipReason}` : ''}`;
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
      return `Assalam o Alaikum, your ASATEK order ${reference} was skipped/cancelled.${skipReason ? ` Reason: ${skipReason}` : ''}`;
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
