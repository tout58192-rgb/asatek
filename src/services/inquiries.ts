import { getApplicableSlab } from '../lib/pricing';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  AdminSalesSummary,
  DashboardCounts,
  InquiryChannel,
  InquiryItem,
  InquiryStatus,
  InquiryWithItems,
  SubmitInquiryPayload,
  SubmitInquiryResult,
  TrackedOrder,
} from '../types/db';
import {
  getMockAdminSalesSummary,
  getMockDashboardCounts,
  getMockTrackedOrder,
  mockStore,
  saveMockStore,
} from './mockData';

function generateMockReference(seq: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `ASK-${y}${m}${d}-${String(seq).padStart(4, '0')}`;
}

export async function submitInquiry(
  payload: SubmitInquiryPayload,
): Promise<SubmitInquiryResult> {
  if (!isSupabaseConfigured || !supabase) {
    const seq = mockStore.seqCounter++;
    const reference = generateMockReference(seq);
    const id = `inq-${Date.now()}-${seq}`;
    const now = new Date().toISOString();

    const items: InquiryItem[] = (payload.items ?? []).map((line, idx) => {
      const product = mockStore.products.find(
        (p) => p.id === line.product_id && p.is_active,
      );
      if (!product) {
        throw new Error('Selected product is no longer available.');
      }
      if (line.quantity < product.moq) {
        throw new Error(`Quantity for ${product.name_en} must be at least ${product.moq}`);
      }
      const slab = getApplicableSlab(product.price_tiers, line.quantity);
      return {
        id: `ii-${Date.now()}-${idx}`,
        inquiry_id: id,
        product_id: product.id,
        product_name: product.name_en,
        sku: product.sku,
        quantity: line.quantity,
        unit_price: slab ? slab.unit_price : null,
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.unit_price ?? 0) * item.quantity,
      0,
    );

    const record: InquiryWithItems = {
      id,
      reference,
      type: payload.type,
      channel: payload.channel,
      name: payload.name,
      phone: payload.phone,
      city: payload.city || null,
      business_name: payload.business_name || null,
      message: payload.message || null,
      status: 'new',
      admin_note: null,
      created_at: now,
      status_updated_at: now,
      confirmed_at: null,
      total_amount: totalAmount,
      skip_reason: null,
      items,
    };

    mockStore.inquiries.unshift(record);
    saveMockStore();
    return { id, reference };
  }

  const { data, error } = await supabase.rpc('submit_inquiry', { payload });
  if (error) throw error;
  return data as SubmitInquiryResult;
}

export interface InquiryListFilters {
  status?: InquiryStatus | 'all';
  channel?: InquiryChannel | 'all';
  q?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listInquiries(
  filters: InquiryListFilters = {},
): Promise<InquiryWithItems[]> {
  if (!isSupabaseConfigured || !supabase) {
    let items = [...mockStore.inquiries];
    if (filters.status && filters.status !== 'all') {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.channel && filters.channel !== 'all') {
      items = items.filter((i) => i.channel === filters.channel);
    }
    if (filters.dateFrom) {
      const fromTs = new Date(`${filters.dateFrom}T00:00:00`).getTime();
      items = items.filter((i) => new Date(i.created_at).getTime() >= fromTs);
    }
    if (filters.dateTo) {
      const toTs = new Date(`${filters.dateTo}T23:59:59.999`).getTime();
      items = items.filter((i) => new Date(i.created_at).getTime() <= toTs);
    }
    if (filters.q && filters.q.trim()) {
      const needle = filters.q.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(needle) ||
          i.phone.toLowerCase().includes(needle) ||
          i.reference.toLowerCase().includes(needle),
      );
    }
    return items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  let query = supabase
    .from('inquiries')
    .select('*, items:inquiry_items(*)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.channel && filters.channel !== 'all') {
    query = query.eq('channel', filters.channel);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
  }
  if (filters.q && filters.q.trim()) {
    const safeQ = filters.q.trim().replace(/[,%]/g, '');
    query = query.or(
      `name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,reference.ilike.%${safeQ}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InquiryWithItems[];
}

export async function getInquiryById(id: string): Promise<InquiryWithItems | null> {
  if (!isSupabaseConfigured || !supabase) {
    return mockStore.inquiries.find((i) => i.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('inquiries')
    .select('*, items:inquiry_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as InquiryWithItems) ?? null;
}

export interface UpdateInquiryPayload {
  status?: InquiryStatus;
  admin_note?: string | null;
  skip_reason?: string | null;
  confirmed_at?: string | null;
  status_updated_at?: string | null;
}

export async function updateInquiry(
  id: string,
  updates: UpdateInquiryPayload,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockStore.inquiries.findIndex((i) => i.id === id);
    if (idx >= 0) {
      mockStore.inquiries[idx] = {
        ...mockStore.inquiries[idx],
        ...updates,
        status_updated_at:
          updates.status_updated_at ??
          (updates.status ? new Date().toISOString() : mockStore.inquiries[idx].status_updated_at),
      };
      saveMockStore();
    }
    return;
  }

  const { error } = await supabase.from('inquiries').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteInquiry(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockStore.inquiries = mockStore.inquiries.filter((i) => i.id !== id);
    saveMockStore();
    return;
  }

  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  if (!isSupabaseConfigured || !supabase) {
    return getMockDashboardCounts();
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  const [totalProdRes, activeProdRes, newOrdRes, newInqRes, weekInqRes] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'quote')
        .eq('status', 'new'),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
    ]);

  if (totalProdRes.error) throw totalProdRes.error;
  if (activeProdRes.error) throw activeProdRes.error;
  if (newOrdRes.error) throw newOrdRes.error;
  if (newInqRes.error) throw newInqRes.error;
  if (weekInqRes.error) throw weekInqRes.error;

  return {
    total_products: totalProdRes.count ?? 0,
    active_products: activeProdRes.count ?? 0,
    new_orders: newOrdRes.count ?? 0,
    new_inquiries: newInqRes.count ?? 0,
    inquiries_last_7_days: weekInqRes.count ?? 0,
  };
}

export type InquiryStatusCounts = Record<InquiryStatus | 'all', number>;

export async function getInquiryStatusCounts(
  filters: Omit<InquiryListFilters, 'status'> = {},
): Promise<InquiryStatusCounts> {
  const rows = await listInquiries({ ...filters, status: 'all' });
  const counts: InquiryStatusCounts = {
    all: rows.length,
    new: 0,
    contacted: 0,
    confirmed: 0,
    dispatched: 0,
    completed: 0,
    skipped: 0,
    closed: 0,
  };
  for (const row of rows) {
    if (row.status in counts) {
      counts[row.status] += 1;
    }
  }
  return counts;
}

export async function trackOrder(
  reference: string,
  phone: string,
): Promise<TrackedOrder | null> {
  const refTrimmed = reference.trim();
  const phoneTrimmed = phone.trim();
  if (!refTrimmed || !phoneTrimmed) return null;

  if (!isSupabaseConfigured || !supabase) {
    return getMockTrackedOrder(refTrimmed, phoneTrimmed);
  }

  const { data, error } = await supabase.rpc('track_order', {
    p_reference: refTrimmed,
    p_phone: phoneTrimmed,
  });
  if (error) throw error;
  if (!data) return null;
  const parsed = data as TrackedOrder;
  return {
    ...parsed,
    items: Array.isArray(parsed.items) ? parsed.items : [],
  };
}

export async function getAdminSalesSummary(
  from: string,
  to: string,
): Promise<AdminSalesSummary> {
  if (!isSupabaseConfigured || !supabase) {
    return getMockAdminSalesSummary(from, to);
  }

  const { data, error } = await supabase.rpc('admin_sales_summary', {
    p_from: from,
    p_to: to,
  });
  if (error) throw error;
  if (!data) {
    throw new Error('admin_sales_summary returned empty response');
  }

  const raw = data as AdminSalesSummary;
  return {
    range: raw.range ?? { from, to },
    totals: {
      orders: Number(raw.totals?.orders ?? 0),
      new_orders: Number(raw.totals?.new_orders ?? 0),
      skipped_orders: Number(raw.totals?.skipped_orders ?? 0),
      confirmed_orders: Number(raw.totals?.confirmed_orders ?? 0),
      revenue: Number(raw.totals?.revenue ?? 0),
      avg_order_value: Number(raw.totals?.avg_order_value ?? 0),
    },
    daily: Array.isArray(raw.daily) ? raw.daily : [],
    monthly: Array.isArray(raw.monthly) ? raw.monthly : [],
    top_products: Array.isArray(raw.top_products) ? raw.top_products : [],
    trending_products: Array.isArray(raw.trending_products)
      ? raw.trending_products
      : [],
    by_status: Array.isArray(raw.by_status) ? raw.by_status : [],
    by_channel: Array.isArray(raw.by_channel) ? raw.by_channel : [],
    by_city: Array.isArray(raw.by_city) ? raw.by_city : [],
  };
}
