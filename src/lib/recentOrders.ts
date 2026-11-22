import type { InquiryChannel } from '../types/db';

const RECENT_ORDERS_KEY = 'asatek_recent_orders_v1';
const MAX_RECENT_ORDERS = 10;

export interface RecentOrderEntry {
  reference: string;
  phone: string;
  created_at: string;
  channel: InquiryChannel;
}

export function loadRecentOrders(): RecentOrderEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentOrderEntry =>
          Boolean(item) &&
          typeof item.reference === 'string' &&
          typeof item.phone === 'string',
      )
      .slice(0, MAX_RECENT_ORDERS);
  } catch {
    return [];
  }
}

export function saveRecentOrder(entry: {
  reference: string;
  phone: string;
  channel: InquiryChannel;
  created_at?: string;
}): RecentOrderEntry[] {
  const ref = entry.reference.trim();
  const phone = entry.phone.trim();
  if (!ref || !phone || phone === '-') return loadRecentOrders();

  const existing = loadRecentOrders().filter(
    (item) => item.reference.toUpperCase() !== ref.toUpperCase(),
  );
  const next: RecentOrderEntry[] = [
    {
      reference: ref,
      phone,
      channel: entry.channel,
      created_at: entry.created_at ?? new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_RECENT_ORDERS);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }
  return next;
}
