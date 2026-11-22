import type { ProductPriceTier } from '../types/db';

export function sortTiers(tiers: ProductPriceTier[]): ProductPriceTier[] {
  return [...tiers].sort((a, b) => a.min_qty - b.min_qty);
}

/**
 * Returns the applicable wholesale price slab for a given quantity:
 * the tier with the highest min_qty <= quantity.
 * Falls back to the lowest tier if quantity is below all min_qty values.
 */
export function getApplicableSlab(
  tiers: ProductPriceTier[],
  quantity: number,
): ProductPriceTier | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = sortTiers(tiers);
  let matched = sorted[0];
  for (const tier of sorted) {
    if (tier.min_qty <= quantity) {
      matched = tier;
    } else {
      break;
    }
  }
  return matched;
}

/**
 * Returns the lowest unit_price across all price slabs ("From PKR X / unit").
 */
export function getLowestUnitPrice(tiers: ProductPriceTier[]): number | null {
  if (!tiers || tiers.length === 0) return null;
  let min = tiers[0].unit_price;
  for (const tier of tiers) {
    if (tier.unit_price < min) {
      min = tier.unit_price;
    }
  }
  return min;
}

export function estimateLineTotal(
  tiers: ProductPriceTier[],
  quantity: number,
): { unitPrice: number; lineTotal: number; slab: ProductPriceTier | null } {
  const safeQty = Math.max(0, Math.floor(quantity));
  const slab = getApplicableSlab(tiers, safeQty);
  const unitPrice = slab ? Number(slab.unit_price) : 0;
  return {
    unitPrice,
    lineTotal: unitPrice * safeQty,
    slab,
  };
}

export function estimateOrderTotal(
  items: Array<{ tiers: ProductPriceTier[]; quantity: number }>,
): number {
  return items.reduce((sum, item) => {
    const { lineTotal } = estimateLineTotal(item.tiers, item.quantity);
    return sum + lineTotal;
  }, 0);
}
