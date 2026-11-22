import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductImageSlot } from '../../components/product/ProductImageSlot';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { formatPKR } from '../../lib/format';
import { getLowestUnitPrice } from '../../lib/pricing';
import {
  deleteProduct,
  duplicateProduct,
  toggleProductField,
} from '../../services/products';
import type { ProductWithDetails } from '../../types/db';

export default function AdminProductsList() {
  const [q, setQ] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  );
  const [deleteTarget, setDeleteTarget] = useState<ProductWithDetails | null>(
    null,
  );

  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: categories } = useCategories(true);
  const { data: result, isLoading } = useProducts({
    categorySlug: categorySlug || undefined,
    q: q || undefined,
    includeInactive: true,
    pageSize: 100,
  });

  const filteredItems = (result?.items ?? []).filter((p) => {
    if (activeFilter === 'active') return p.is_active;
    if (activeFilter === 'inactive') return !p.is_active;
    return true;
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
  };

  const handleToggle = async (
    product: ProductWithDetails,
    field: 'is_active' | 'is_featured',
  ) => {
    try {
      await toggleProductField(product.id, field, !product[field]);
      await invalidate();
      showToast('Product updated');
    } catch {
      showToast('Failed to update product', 'error');
    }
  };

  const handleDuplicate = async (product: ProductWithDetails) => {
    try {
      await duplicateProduct(product.id);
      await invalidate();
      showToast('Product duplicated (set to inactive draft)');
    } catch {
      showToast('Failed to duplicate product', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      await invalidate();
      showToast('Product deleted');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[var(--ink-soft)] absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or SKU..."
                className="w-full min-h-[44px] rounded-lg border border-[var(--line)] bg-white ps-10 pe-3.5 text-sm"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                aria-label="Filter by category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              >
                <option value="">All Categories</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name_en}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select
                aria-label="Filter by active status"
                value={activeFilter}
                onChange={(e) =>
                  setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Hidden Only</option>
              </Select>
            </div>
          </div>

          <Link to="/admin/products/new">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Product</th>
                  <th className="px-4 py-3 text-start">SKU</th>
                  <th className="px-4 py-3 text-start">Category</th>
                  <th className="px-4 py-3 text-end">From Price</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <TableRowSkeleton cols={7} />
                    <TableRowSkeleton cols={7} />
                  </>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[var(--ink-soft)]"
                    >
                      No products match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((product) => {
                    const imgUrl =
                      product.images.find((i) => i.is_primary)?.image_url ||
                      product.images[0]?.image_url ||
                      null;
                    const lowest = getLowestUnitPrice(product.price_tiers);

                    return (
                      <tr
                        key={product.id}
                        className="border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg border border-[var(--line)] overflow-hidden shrink-0">
                              <ProductImageSlot
                                imageUrl={imgUrl}
                                alt={product.name_en}
                                categoryIcon={product.category?.icon}
                              />
                            </div>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="font-medium text-[var(--ink)] hover:text-[var(--brand-red)] line-clamp-1 max-w-xs"
                            >
                              {product.name_en}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono-num text-xs text-[var(--ink-soft)]">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--ink-soft)]">
                          {product.category?.name_en || '—'}
                        </td>
                        <td className="px-4 py-3 text-end font-semibold tabular-nums">
                          {lowest !== null ? formatPKR(lowest) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Active status for ${product.name_en}`}
                            checked={product.is_active}
                            onChange={() => handleToggle(product, 'is_active')}
                            className="w-4 h-4 accent-[var(--accent-green)] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Featured status for ${product.name_en}`}
                            checked={product.is_featured}
                            onChange={() => handleToggle(product, 'is_featured')}
                            className="w-4 h-4 accent-[var(--brand-red)] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/admin/products/${product.id}`}
                              aria-label={`Edit ${product.name_en}`}
                              className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--bg-alt)]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(product)}
                              aria-label={`Duplicate ${product.name_en}`}
                              className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--bg-alt)] cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              aria-label={`Delete ${product.name_en}`}
                              className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] rounded-lg hover:bg-[var(--brand-red-light)] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Are you sure you want to delete{' '}
            <strong className="text-[var(--ink)]">{deleteTarget?.name_en}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
