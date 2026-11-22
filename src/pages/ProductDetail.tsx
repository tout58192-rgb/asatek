import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Minus, Plus } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { PriceSlabTable } from '../components/product/PriceSlabTable';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGallery } from '../components/product/ProductGallery';
import { SpecsTable } from '../components/product/SpecsTable';
import { AvailabilityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useI18n } from '../contexts/LanguageContext';
import { useQuote } from '../contexts/QuoteContext';
import { useToast } from '../contexts/ToastContext';
import { useProductBySlug, useRelatedProducts } from '../hooks/useProduct';
import { useSettings } from '../hooks/useSettings';
import { formatPKR } from '../lib/format';
import { pickSetting } from '../lib/i18n';
import { estimateLineTotal } from '../lib/pricing';
import { buildProductWhatsAppMessage, buildWhatsAppLink } from '../lib/whatsapp';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, pick } = useI18n();
  const { addItem } = useQuote();
  const { showToast } = useToast();
  const { data: settings } = useSettings();

  const { data: product, isLoading, isError, refetch } = useProductBySlug(slug);
  const { data: related } = useRelatedProducts(product?.category_id, product?.id);

  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setQuantity(product.moq);
    }
  }, [product]);

  if (isLoading) {
    return (
      <Layout title={t('common.loading')}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 aspect-square rounded-xl skeleton-shimmer" />
            <div className="lg:col-span-7 space-y-4">
              <div className="h-6 w-1/3 rounded skeleton-shimmer" />
              <div className="h-10 w-3/4 rounded skeleton-shimmer" />
              <div className="h-40 w-full rounded-xl skeleton-shimmer" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout title={t('products.errorTitle')}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14">
          <EmptyState
            variant="error"
            title={t('products.errorTitle')}
            action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>}
          />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title={t('productDetail.notFoundTitle')}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14">
          <EmptyState
            title={t('productDetail.notFoundTitle')}
            description={t('productDetail.notFoundDesc')}
            action={
              <Link to="/products">
                <Button variant="primary">{t('common.browseProducts')}</Button>
              </Link>
            }
          />
        </div>
      </Layout>
    );
  }

  const name = pick(product as unknown as Record<string, unknown>, 'name');
  const shortDesc = pick(
    product as unknown as Record<string, unknown>,
    'short_desc',
  );
  const categoryName = product.category
    ? pick(product.category as unknown as Record<string, unknown>, 'name')
    : '';
  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    null;

  const safeQty = Math.max(product.moq, quantity || product.moq);
  const { unitPrice, lineTotal } = estimateLineTotal(product.price_tiers, safeQty);

  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppLink(
        whatsappNumber,
        buildProductWhatsAppMessage({
          name: product.name_en,
          sku: product.sku,
          quantity: safeQty,
        }),
      )
    : '#';

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      quantity: safeQty,
      snapshot_name_en: product.name_en,
      snapshot_name_ur: product.name_ur,
      snapshot_sku: product.sku,
      snapshot_moq: product.moq,
      snapshot_image_url: primaryImage,
    });
    showToast(t('common.addedToOrder'), 'success', {
      label: t('common.viewOrderList'),
      to: '/quote',
    });
  };

  return (
    <Layout title={name} description={shortDesc || name}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 space-y-12">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--ink-soft)]"
        >
          <Link to="/" className="hover:text-[var(--brand-red)]">
            {t('productDetail.breadcrumbHome')}
          </Link>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          <Link to="/products" className="hover:text-[var(--brand-red)]">
            {t('productDetail.breadcrumbProducts')}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-[var(--brand-red)]"
              >
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          <span className="text-[var(--ink)] font-medium truncate">{name}</span>
        </nav>

        {/* Main Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Gallery */}
          <div className="lg:col-span-5">
            <ProductGallery
              images={product.images}
              alt={name}
              sku={product.sku}
              categoryIcon={product.category?.icon}
            />
          </div>

          {/* Contiguous Purchase & Slab Module */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
                {categoryName && <span>{categoryName}</span>}
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">
                  {t('common.sku')}: {product.sku}
                </span>
                <AvailabilityBadge status={product.availability} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                {name}
              </h1>

              {shortDesc && (
                <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed">
                  {shortDesc}
                </p>
              )}
            </div>

            {product.availability === 'out_of_stock' && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-sm text-[var(--warn)]">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('availability.outOfStockWarning')}</span>
              </div>
            )}

            {/* Wholesale Price Slab Table */}
            <PriceSlabTable
              tiers={product.price_tiers}
              currentQuantity={safeQty}
            />

            {/* Quantity & Live Calculation */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="detail-quantity"
                    className="block text-sm font-semibold text-[var(--ink)]"
                  >
                    {t('productDetail.quantityLabel')}
                  </label>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    {t('productDetail.minOrderNote', { moq: product.moq })}
                  </p>
                </div>

                <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white overflow-hidden">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={safeQty <= product.moq}
                    onClick={() =>
                      setQuantity((q) => Math.max(product.moq, q - 1))
                    }
                    className="w-11 h-11 flex items-center justify-center text-[var(--ink)] hover:bg-[var(--bg-alt)] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="detail-quantity"
                    type="number"
                    min={product.moq}
                    max={1000000}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuantity(Number.isNaN(val) ? product.moq : val);
                    }}
                    onBlur={() => setQuantity((q) => Math.max(product.moq, q))}
                    className="w-20 h-11 text-center text-sm font-semibold tabular-nums border-x border-[var(--line)] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(1000000, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-[var(--ink)] hover:bg-[var(--bg-alt)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--line)]">
                <div>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {t('productDetail.unitRateLabel')}
                  </p>
                  <p className="text-lg font-bold text-[var(--ink)] tabular-nums">
                    {formatPKR(unitPrice)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-[var(--ink-soft)]">
                    {t('productDetail.lineTotalLabel')}
                  </p>
                  <p className="text-xl font-bold text-[var(--brand-red)] tabular-nums">
                    {formatPKR(lineTotal)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAdd}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('common.addToOrder')}</span>
                </Button>

                {whatsappNumber && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-lg bg-[var(--whatsapp)] text-white font-medium text-sm sm:text-base hover:bg-[var(--whatsapp-dark)] transition-colors whitespace-nowrap"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>{t('productDetail.askWhatsapp')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specs Table */}
        <SpecsTable specs={product.specs} />

        {/* Related Products */}
        {related && related.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-[var(--line)]">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--ink)]">
              {t('productDetail.relatedTitle')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
