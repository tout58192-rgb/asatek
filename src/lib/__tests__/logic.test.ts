import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getApplicableSlab,
  getLowestUnitPrice,
  estimateLineTotal,
  estimateOrderTotal,
} from '../pricing';
import { formatPKR, slugify } from '../format';
import {
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  buildOrderWhatsAppMessage,
} from '../whatsapp';
import { buyerOrderSchema, whatsappSettingSchema, validateQuantity } from '../validation';
import { pick } from '../i18n';
import type { ProductPriceTier } from '../../types/db';

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
