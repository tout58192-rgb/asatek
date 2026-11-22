export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidWhatsAppNumber(raw: string): boolean {
  const digits = normalizeWhatsAppNumber(raw);
  return /^\d{10,15}$/.test(digits);
}

export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(number);
  const base = `https://wa.me/${digits}`;
  if (!message || !message.trim()) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(message)}`;
}

export interface OrderWhatsAppLine {
  productName: string;
  sku?: string | null;
  quantity: number;
}

export function buildOrderWhatsAppMessage(params: {
  reference: string;
  name: string;
  city?: string;
  phone: string;
  items: OrderWhatsAppLine[];
  message?: string;
}): string {
  const lines: string[] = [
    'Assalam o Alaikum ASATEK,',
    `Order request ${params.reference}`,
    `Name: ${params.name} | City: ${params.city || '-'} | Phone: ${params.phone}`,
  ];

  params.items.forEach((item, idx) => {
    const skuPart = item.sku ? ` (${item.sku})` : '';
    lines.push(`${idx + 1}) ${item.productName}${skuPart} x ${item.quantity}`);
  });

  if (params.message && params.message.trim()) {
    lines.push(`Notes: ${params.message.trim()}`);
  }

  return lines.join('\n');
}

export function buildProductWhatsAppMessage(params: {
  name: string;
  sku: string;
  quantity?: number;
}): string {
  const qtyText = params.quantity ? `\nQuantity needed: ${params.quantity}` : '';
  return `Assalam o Alaikum ASATEK,\nI would like wholesale details and rates for:\n${params.name} (${params.sku})${qtyText}`;
}
