import { useI18n } from '../../contexts/LanguageContext';
import { formatPKR } from '../../lib/format';
import { getApplicableSlab, sortTiers } from '../../lib/pricing';
import type { ProductPriceTier } from '../../types/db';

interface PriceSlabTableProps {
  tiers: ProductPriceTier[];
  currentQuantity: number;
}

export function PriceSlabTable({ tiers, currentQuantity }: PriceSlabTableProps) {
  const { t } = useI18n();
  const sorted = sortTiers(tiers);
  const activeSlab = getApplicableSlab(sorted, currentQuantity);

  if (sorted.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--line)] overflow-hidden">
      <div className="bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white">
        {t('productDetail.slabTitle')}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-start">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-[var(--ink-soft)]">
              <th className="px-4 py-2.5 text-start font-medium">
                {t('productDetail.slabMinQty')}
              </th>
              <th className="px-4 py-2.5 text-end font-medium">
                {t('productDetail.slabUnitPrice')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tier, idx) => {
              const isActive = activeSlab?.id === tier.id;
              return (
                <tr
                  key={tier.id}
                  className={`border-b last:border-b-0 border-[var(--line)] ${
                    isActive
                      ? 'bg-[var(--brand-red-light)] font-semibold text-[var(--ink)]'
                      : idx % 2 === 1
                        ? 'bg-[var(--bg-alt)]/50'
                        : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-2.5 tabular-nums">
                    <span>
                      {tier.min_qty}+ {t('common.units')}
                    </span>
                    {isActive && (
                      <span className="ms-2.5 text-xs font-semibold text-[var(--brand-red)]">
                        · {t('productDetail.slabActive')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-end tabular-nums text-[var(--brand-red-dark)]">
                    {formatPKR(tier.unit_price)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
