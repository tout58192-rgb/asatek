import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getApplicableSlab,
  getLowestUnitPrice,
  estimateLineTotal,
  estimateOrderTotal,
} from '../pricing';
import { formatPKR, getErrorMessage, slugify } from '../format';
import {
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  buildOrderWhatsAppMessage,
  buildProductWhatsAppMessage,
} from '../whatsapp';
import {
  parseManagedStorageUrl,
  getThumbnailStoragePath,
  getThumbnailPublicUrl,
} from '../storageUrl';
import {
  getOrderTimelineStep,
  isRevenueStatus,
  getInquiryTotalAmount,
  formatBuyerReplyDigits,
  buildBuyerStatusWhatsAppMessage,
  getPresetDateRange,
  findBestDay,
  findBestMonth,
  buildOrdersCsv,
  formatShortPKR,
  formatShortChartDate,
  buildContinuousDailySeries,
} from '../orderHelpers';
import { getMockTrackedOrder, getMockAdminSalesSummary } from '../../services/mockData';
import { buyerOrderSchema, whatsappSettingSchema, validateQuantity } from '../validation';
import { pick } from '../i18n';
import type { InquiryWithItems, ProductPriceTier } from '../../types/db';

const sampleTiers: ProductPriceTier[] = [
  { id: 't3', product_id: 'p1', min_qty: 50, unit_price: 2100 },
  { id: 't1', product_id: 'p1', min_qty: 5, unit_price: 2500 },
  { id: 't2', product_id: 'p1', min_qty: 20, unit_price: 2300 },
];

test('pricing: getApplicableSlab picks highest min_qty <= quantity', () => {
  assert.equal(getApplicableSlab(sampleTiers, 5)?.unit_price, 2500);
  assert.equal(getApplicableSlab(sampleTiers, 19)?.unit_price, 2500);
  assert.equal(getApplicableSlab(sampleTiers, 20)?.unit_price, 2300);
  assert.equal(getApplicableSlab(sampleTiers, 49)?.unit_price, 2300);
  assert.equal(getApplicableSlab(sampleTiers, 50)?.unit_price, 2100);
  assert.equal(getApplicableSlab(sampleTiers, 200)?.unit_price, 2100);
  assert.equal(getApplicableSlab([], 10), null);
});

test('pricing: getLowestUnitPrice returns lowest slab price', () => {
  assert.equal(getLowestUnitPrice(sampleTiers), 2100);
  assert.equal(getLowestUnitPrice([]), null);
});

test('pricing: estimateLineTotal and estimateOrderTotal calculate accurately', () => {
  const line1 = estimateLineTotal(sampleTiers, 25);
  assert.equal(line1.unitPrice, 2300);
  assert.equal(line1.lineTotal, 57500);

  const total = estimateOrderTotal([
    { tiers: sampleTiers, quantity: 10 }, // 10 * 2500 = 25000
    { tiers: sampleTiers, quantity: 50 }, // 50 * 2100 = 105000
  ]);
  assert.equal(total, 130000);
});

test('format: formatPKR formats Western digits cleanly', () => {
  assert.equal(formatPKR(1250), 'PKR 1,250');
  assert.equal(formatPKR(0), 'PKR 0');
  assert.equal(formatPKR(125000), 'PKR 125,000');
  assert.equal(slugify('Solar Charge Controllers!'), 'solar-charge-controllers');
});

test('whatsapp: normalizes, validates, and builds order message', () => {
  assert.equal(normalizeWhatsAppNumber('+92 300-1234567'), '923001234567');
  assert.equal(isValidWhatsAppNumber('923001234567'), true);
  assert.equal(isValidWhatsAppNumber('12345'), false);

  const msg = buildOrderWhatsAppMessage({
    reference: 'ASK-20261121-0001',
    name: 'Tariq Mahmood',
    city: 'Multan',
    phone: '03001234567',
    items: [
      { productName: 'SC5 VA-1260 Solar Controller', sku: 'ASK-SC5VA-1260', quantity: 20 },
    ],
    message: 'Urgent dispatch',
  });

  assert.ok(msg.includes('Assalam o Alaikum ASATEK,'));
  assert.ok(msg.includes('Order request ASK-20261121-0001'));
  assert.ok(msg.includes('1) SC5 VA-1260 Solar Controller (ASK-SC5VA-1260) x 20'));
  assert.ok(msg.includes('Notes: Urgent dispatch'));

  const url = buildWhatsAppLink('923001234567', msg);
  assert.ok(url.startsWith('https://wa.me/923001234567?text='));
});

test('validation: buyerOrderSchema and whatsappSettingSchema enforce rules', () => {
  const okBuyer = buyerOrderSchema.safeParse({
    name: 'Bilal Electronics',
    phone: '0300-9876543',
    city: 'Lahore',
    business_name: 'Bilal Solar',
    message: 'Call before shipping',
  });
  assert.equal(okBuyer.success, true);

  const badPhone = buyerOrderSchema.safeParse({
    name: 'Ali',
    phone: '123',
    city: 'Lahore',
  });
  assert.equal(badPhone.success, false);

  assert.equal(whatsappSettingSchema.safeParse({ whatsapp_number: '923001234567' }).success, true);
  assert.equal(whatsappSettingSchema.safeParse({ whatsapp_number: '+923001234567' }).success, false);
  assert.equal(validateQuantity(5, 5), true);
  assert.equal(validateQuantity(4, 5), false);
});

test('i18n: pick selects Urdu when available and falls back to English', () => {
  const item = { name_en: 'Inverter', name_ur: 'انورٹر', desc_en: 'Pure sine', desc_ur: '' };
  assert.equal(pick(item, 'name', 'en'), 'Inverter');
  assert.equal(pick(item, 'name', 'ur'), 'انورٹر');
  assert.equal(pick(item, 'desc', 'ur'), 'Pure sine');
});

test('format: getErrorMessage extracts Error and Postgrest-like object messages', () => {
  assert.equal(getErrorMessage(new Error('DB constraint failed'), 'Fallback'), 'DB constraint failed');
  assert.equal(getErrorMessage({ message: 'new row violates row-level security', code: '42501' }, 'Fallback'), 'new row violates row-level security');
  assert.equal(getErrorMessage({ message: '   ' }, 'Fallback'), 'Fallback');
  assert.equal(getErrorMessage(null, 'Fallback'), 'Fallback');
});

test('storageUrl: parseManagedStorageUrl matches managed buckets only', () => {
  const supabaseUrl = 'https://sihdukiyucmvbtfbacjv.supabase.co';
  assert.deepEqual(
    parseManagedStorageUrl(
      'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/product-images/products/123/photo%201.webp',
      supabaseUrl,
    ),
    { bucket: 'product-images', path: 'products/123/photo 1.webp' },
  );
  assert.deepEqual(
    parseManagedStorageUrl(
      'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/site-assets/site/banner.jpg',
      supabaseUrl,
    ),
    { bucket: 'site-assets', path: 'site/banner.jpg' },
  );
  assert.equal(
    parseManagedStorageUrl('https://cdn.example.com/storage/v1/object/public/product-images/a.jpg', supabaseUrl),
    null,
  );
  assert.equal(
    parseManagedStorageUrl('https://images.unsplash.com/photo-123', supabaseUrl),
    null,
  );
  assert.equal(
    parseManagedStorageUrl(
      'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/other-bucket/a.jpg',
      supabaseUrl,
    ),
    null,
  );
});

test('storageUrl: getThumbnailStoragePath and getThumbnailPublicUrl handle managed vs external vs SVG URLs', () => {
  const supabaseUrl = 'https://sihdukiyucmvbtfbacjv.supabase.co';
  assert.equal(getThumbnailStoragePath('products/p1/hero.webp'), 'products/p1/hero_thumb.webp');
  assert.equal(getThumbnailStoragePath('products/p1/hero_thumb.webp'), 'products/p1/hero_thumb.webp');
  assert.equal(getThumbnailStoragePath('site/logo.svg'), 'site/logo.svg');

  assert.equal(
    getThumbnailPublicUrl(
      'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/product-images/products/p1/img.webp',
      supabaseUrl,
    ),
    'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/product-images/products/p1/img_thumb.webp',
  );
  // External URLs and SVGs stay untouched
  assert.equal(
    getThumbnailPublicUrl('https://images.unsplash.com/photo-123', supabaseUrl),
    'https://images.unsplash.com/photo-123',
  );
  assert.equal(
    getThumbnailPublicUrl(
      'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/site-assets/site/logo.svg',
      supabaseUrl,
    ),
    'https://sihdukiyucmvbtfbacjv.supabase.co/storage/v1/object/public/site-assets/site/logo.svg',
  );
});

test('whatsapp: buildProductWhatsAppMessage includes SKU, quantity, and productUrl', () => {
  const msg = buildProductWhatsAppMessage({
    name: 'SC5 VA-1260 Solar Controller',
    sku: 'ASK-SC5VA-1260',
    quantity: 5,
    productUrl: 'https://asatek.sadiqabad.workers.dev/products/sc5-va-1260',
  });
  assert.ok(msg.includes('SC5 VA-1260 Solar Controller (ASK-SC5VA-1260)'));
  assert.ok(msg.includes('Quantity: 5'));
  assert.ok(msg.includes('Link: https://asatek.sadiqabad.workers.dev/products/sc5-va-1260'));
});

test('orderHelpers: timeline step, revenue status, total calculation, and buyer phone normalization', () => {
  assert.equal(getOrderTimelineStep('new'), 0);
  assert.equal(getOrderTimelineStep('contacted'), 0);
  assert.equal(getOrderTimelineStep('confirmed'), 1);
  assert.equal(getOrderTimelineStep('dispatched'), 2);
  assert.equal(getOrderTimelineStep('completed'), 3);
  assert.equal(getOrderTimelineStep('skipped'), -1);
  assert.equal(getOrderTimelineStep('cancelled'), -1);

  assert.equal(isRevenueStatus('new'), false);
  assert.equal(isRevenueStatus('skipped'), false);
  assert.equal(isRevenueStatus('cancelled'), false);
  assert.equal(isRevenueStatus('confirmed'), true);
  assert.equal(isRevenueStatus('dispatched'), true);
  assert.equal(isRevenueStatus('completed'), true);

  assert.equal(formatBuyerReplyDigits('-'), null);
  assert.equal(formatBuyerReplyDigits('0300-1234567'), '923001234567');
  assert.equal(formatBuyerReplyDigits('+92 321 7654321'), '923217654321');
  assert.equal(formatBuyerReplyDigits('123'), null);

  const inq: InquiryWithItems = {
    id: 'i1',
    reference: 'ASK-20261122-0001',
    type: 'quote',
    channel: 'website',
    name: 'Ali',
    phone: '03001234567',
    city: 'Multan',
    business_name: null,
    message: null,
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-11-22T10:00:00Z',
    items: [
      { id: 'ii1', inquiry_id: 'i1', product_id: 'p1', product_name: 'UPS', sku: 'U1', quantity: 2, unit_price: 18500 },
    ],
  };
  assert.equal(getInquiryTotalAmount(inq), 37000);
  assert.equal(getInquiryTotalAmount({ ...inq, total_amount: 40000 }), 40000);
});

test('orderHelpers: buyer status WhatsApp messages (EN & UR) and date/CSV helpers', () => {
  const enConfirmed = buildBuyerStatusWhatsAppMessage({
    reference: 'ASK-101',
    status: 'confirmed',
    lang: 'en',
  });
  assert.ok(enConfirmed.includes('ASK-101'));
  assert.ok(enConfirmed.includes('confirmed'));

  const urSkipped = buildBuyerStatusWhatsAppMessage({
    reference: 'ASK-102',
    status: 'skipped',
    skipReason: 'Out of stock',
    lang: 'ur',
  });
  assert.ok(urSkipped.includes('ASK-102'));
  assert.ok(urSkipped.includes('Out of stock'));

  const fixedNow = new Date(2026, 10, 22, 12, 0, 0); // Nov 22, 2026
  assert.deepEqual(getPresetDateRange('today', fixedNow), {
    from: '2026-11-22',
    to: '2026-11-22',
  });
  assert.deepEqual(getPresetDateRange('this_month', fixedNow), {
    from: '2026-11-01',
    to: '2026-11-22',
  });
  assert.deepEqual(getPresetDateRange('last_month', fixedNow), {
    from: '2026-10-01',
    to: '2026-10-31',
  });

  assert.equal(
    findBestDay([
      { date: '2026-11-20', orders: 1, revenue: 1000 },
      { date: '2026-11-21', orders: 3, revenue: 95000 },
    ])?.date,
    '2026-11-21',
  );
  assert.equal(findBestDay([]), null);

  assert.equal(
    findBestMonth([
      { month: '2026-10', orders: 4, revenue: 50000 },
      { month: '2026-11', orders: 8, revenue: 210000 },
    ])?.month,
    '2026-11',
  );

  const csv = buildOrdersCsv([
    {
      id: 'i1',
      reference: 'ASK-20261122-0001',
      type: 'quote',
      channel: 'website',
      name: 'Ahmed, "Solar" Co',
      phone: '03001234567',
      city: 'Lahore',
      business_name: null,
      message: null,
      status: 'confirmed',
      admin_note: 'Priority',
      created_at: '2026-11-22T10:00:00Z',
      total_amount: 50000,
      items: [
        { id: '1', inquiry_id: 'i1', product_id: 'p1', product_name: 'Controller', sku: 'SC5', quantity: 10, unit_price: 5000 },
      ],
    },
  ]);
  assert.ok(csv.startsWith('Reference,Date,Type,Channel,Status,Buyer Name,Phone,City,Business Name,Items,Total (PKR),Skip Reason,Admin Note'));
  assert.ok(csv.includes('"Ahmed, ""Solar"" Co"'));
  assert.ok(csv.includes('50000'));
});

test('mockData: getMockTrackedOrder and getMockAdminSalesSummary work deterministically', () => {
  const found = getMockTrackedOrder('ask-20261121-0001', '0300-1234567');
  assert.ok(found);
  assert.equal(found.reference, 'ASK-20261121-0001');
  assert.equal(found.items.length, 2);

  const missing = getMockTrackedOrder('ASK-99999999-9999', '03001234567');
  assert.equal(missing, null);

  const summary = getMockAdminSalesSummary('2020-01-01', '2030-12-31');
  assert.ok(summary.totals.orders >= 2);
  assert.ok(summary.totals.revenue >= 139000);
  assert.ok((summary.totals.cancelled_orders ?? 0) >= 1);
  assert.ok(summary.by_status.length > 0);
  assert.ok(summary.by_channel.length > 0);
});

test('orderHelpers: cancelled WhatsApp message and Sales by date chart helpers', () => {
  const enCancelled = buildBuyerStatusWhatsAppMessage({
    reference: 'ASK-103',
    status: 'cancelled',
    skipReason: 'Out of stock',
    lang: 'en',
  });
  assert.ok(enCancelled.includes('cancelled'));
  assert.ok(enCancelled.includes('Out of stock'));

  const urCancelled = buildBuyerStatusWhatsAppMessage({
    reference: 'ASK-103',
    status: 'cancelled',
    skipReason: 'اسٹاک ختم',
    lang: 'ur',
  });
  assert.ok(urCancelled.includes('منسوخ'));
  assert.ok(urCancelled.includes('اسٹاک ختم'));

  assert.equal(formatShortPKR(0), '0');
  assert.equal(formatShortPKR(850), '850');
  assert.equal(formatShortPKR(1500), '1.5K');
  assert.equal(formatShortPKR(85000), '85K');
  assert.equal(formatShortPKR(1500000), '1.5M');
  assert.equal(formatShortPKR(2000000), '2M');

  assert.equal(formatShortChartDate('2026-11-14'), '14 Nov');
  assert.equal(formatShortChartDate('2026-01-05'), '5 Jan');

  const continuous = buildContinuousDailySeries(
    [
      { date: '2026-11-12', orders: 1, revenue: 12000 },
      { date: '2026-11-14', orders: 2, revenue: 50000 },
      { date: '2026-11-14', orders: 1, revenue: 35000 },
    ],
    '2026-11-12',
    '2026-11-15',
    '2026-11-15',
  );
  assert.equal(continuous.length, 4);
  assert.deepEqual(continuous[0], { date: '2026-11-12', orders: 1, revenue: 12000 });
  assert.deepEqual(continuous[1], { date: '2026-11-13', orders: 0, revenue: 0 });
  assert.deepEqual(continuous[2], { date: '2026-11-14', orders: 3, revenue: 85000 });
  assert.deepEqual(continuous[3], { date: '2026-11-15', orders: 0, revenue: 0 });
});
