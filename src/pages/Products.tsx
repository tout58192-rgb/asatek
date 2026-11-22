import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Select } from '../components/ui/Select';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useI18n } from '../contexts/LanguageContext';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import type { ProductSort } from '../types/db';

const PAGE_SIZE = 24;

export default function Products() {
  const { t, pick } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categorySlug = searchParams.get('category') || '';
  const urlQ = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as ProductSort) || 'newest';
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  const [searchInput, setSearchInput] = useState(urlQ);

  useEffect(() => {
    setSearchInput(urlQ);
  }, [urlQ]);

  const { data: categories } = useCategories();
  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useProducts({
    categorySlug: categorySlug || undefined,
    q: urlQ || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const updateParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    if (!('page' in updates)) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam({ q: searchInput.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const categoryFilterList = (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          updateParam({ category: null });
          setMobileFilterOpen(false);
        }}
        className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          !categorySlug
            ? 'bg-[var(--brand-red-light)] text-[var(--brand-red)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]'
        }`}
      >
        {t('common.allCategories')}
      </button>
      {(categories ?? []).map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => {
            updateParam({ category: cat.slug });
            setMobileFilterOpen(false);
          }}
          className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            categorySlug === cat.slug
              ? 'bg-[var(--brand-red-light)] text-[var(--brand-red)] font-semibold'
              : 'text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]'
          }`}
        >
          {pick(cat as unknown as Record<string, unknown>, 'name')}
        </button>
      ))}
    </div>
  );

  return (
    <Layout title={t('products.title')} description={t('products.subtitle')}>
      <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            {t('products.title')}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--ink-soft)]">
            {t('products.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="rounded-xl border border-[var(--line)] bg-white p-4">
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">
                {t('common.category')}
              </h2>
              {categoryFilterList}
            </div>
          </aside>

          {/* Main Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-1 gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--ink-soft)] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchInput(val);
                      if (val === '' && urlQ !== '') {
                        updateParam({ q: null });
                      }
                    }}
                    placeholder={t('common.searchPlaceholder')}
                    aria-label={t('common.searchPlaceholder')}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--line)] bg-white ps-10 pe-3.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 focus:border-[var(--brand-red)]"
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  <Search className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </form>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="lg:hidden"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t('common.filter')}</span>
                </Button>

                <div className="w-full sm:w-48">
                  <Select
                    aria-label="Sort products"
                    value={sort}
                    onChange={(e) => updateParam({ sort: e.target.value })}
                  >
                    <option value="newest">{t('common.sortNewest')}</option>
                    <option value="name_asc">{t('common.sortName')}</option>
                    <option value="price_asc">{t('common.sortPrice')}</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active filter status & count */}
            {!isLoading && !isError && result && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--ink-soft)]">
                <span className="tabular-nums">
                  {t('products.showingCount', { count: result.total })}
                </span>
                {(categorySlug || urlQ) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[var(--brand-red)] hover:underline cursor-pointer"
                  >
                    {t('common.clearFilters')}
                  </button>
                )}
              </div>
            )}

            {/* Grid States */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                variant="error"
                title={t('products.errorTitle')}
                action={
                  <Button variant="primary" onClick={() => refetch()}>
                    {t('common.retry')}
                  </Button>
                }
              />
            ) : !result || result.items.length === 0 ? (
              <EmptyState
                title={t('products.emptyTitle')}
                description={t('products.emptyDesc')}
                action={
                  <Button variant="secondary" onClick={clearAllFilters}>
                    {t('common.clearFilters')}
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {result.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  page={result.page}
                  pageSize={result.pageSize}
                  total={result.total}
                  onPageChange={(nextPage) =>
                    updateParam({ page: String(nextPage) })
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Filter Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50 flex items-end"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-white p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
              <h2 className="text-base font-semibold text-[var(--ink)]">
                {t('common.category')}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label={t('common.close')}
                className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {categoryFilterList}
          </div>
        </div>
      )}
    </Layout>
  );
}
