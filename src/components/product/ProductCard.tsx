import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/LanguageContext';
import { formatPKR } from '../../lib/format';
import { getLowestUnitPrice } from '../../lib/pricing';
import type { ProductWithDetails } from '../../types/db';
import { AvailabilityBadge } from '../ui/Badge';
import { ProductActions } from './ProductActions';
import { ProductImageSlot } from './ProductImageSlot';

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const { t, pick } = useI18n();

  const name = pick(product as unknown as Record<string, unknown>, 'name');
  const categoryName = product.category
    ? pick(product.category as unknown as Record<string, unknown>, 'name')
    : '';
  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    null;
  const lowestPrice = getLowestUnitPrice(product.price_tiers);

  return (
    <article className="group flex flex-col rounded-2xl border border-[var(--line)] bg-white overflow-hidden shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-gray-300/90">
      <Link
        to={`/products/${product.slug}`}
        className="block aspect-square w-full overflow-hidden border-b border-[var(--line)] bg-[#F5F5F7]"
      >
        <ProductImageSlot
          imageUrl={primaryImage}
          alt={name}
          sku={product.sku}
          categoryIcon={product.category?.icon}
          useThumb
          width={480}
          height={480}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Clean metadata line (zero-pill) */}
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--ink-soft)] mb-2">
          <span className="truncate font-medium">{categoryName}</span>
          <span className="font-mono-num shrink-0 opacity-85">{product.sku}</span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="text-sm sm:text-base font-semibold text-[var(--ink)] hover:text-[var(--brand-red)] transition-colors line-clamp-2 min-h-[2.75rem]"
        >
          {name}
        </Link>

        <div className="mt-auto pt-3 space-y-3">
          {/* Neat price slab chip */}
          <div className="rounded-xl border border-red-100 bg-[var(--brand-red-light)]/55 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              {lowestPrice !== null ? (
                <p className="text-base font-bold text-[var(--brand-red)] tabular-nums leading-tight">
                  <span className="text-xs font-normal text-[var(--ink-soft)] me-1">
                    {t('common.from')}
                  </span>
                  {formatPKR(lowestPrice)}
                  <span className="text-xs font-normal text-[var(--ink-soft)] ms-1">
                    {t('common.perUnit')}
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-[var(--ink-soft)]">—</p>
              )}
              <p className="text-[11px] text-[var(--ink-soft)] tabular-nums mt-0.5">
                {t('common.moq')}: {product.moq} {t('common.units')}
              </p>
            </div>
            <AvailabilityBadge status={product.availability} />
          </div>

          <ProductActions product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
