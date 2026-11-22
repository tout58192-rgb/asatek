import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  ImageUploader,
  type EditableImageItem,
} from '../../components/admin/ImageUploader';
import {
  PriceSlabEditor,
  type EditablePriceTier,
} from '../../components/admin/PriceSlabEditor';
import {
  SpecsEditor,
  type EditableSpecRow,
} from '../../components/admin/SpecsEditor';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { useCategories } from '../../hooks/useCategories';
import { useProductById } from '../../hooks/useProduct';
import { slugify } from '../../lib/format';
import { saveProduct } from '../../services/products';
import type { AvailabilityStatus } from '../../types/db';

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: categories } = useCategories(true);
  const { data: existing, isLoading: loadingProduct } = useProductById(id);

  const [categoryId, setCategoryId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [shortDescUr, setShortDescUr] = useState('');
  const [moq, setMoq] = useState(1);
  const [availability, setAvailability] =
    useState<AvailabilityStatus>('in_stock');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<EditableImageItem[]>([]);
  const [tiers, setTiers] = useState<EditablePriceTier[]>([
    { min_qty: 1, unit_price: 0 },
  ]);
  const [specs, setSpecs] = useState<EditableSpecRow[]>([]);

  const [slabError, setSlabError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit && categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [isEdit, categories, categoryId]);

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.category_id);
      setNameEn(existing.name_en);
      setNameUr(existing.name_ur ?? '');
      setSlug(existing.slug);
      setSku(existing.sku);
      setShortDescEn(existing.short_desc_en ?? '');
      setShortDescUr(existing.short_desc_ur ?? '');
      setMoq(existing.moq);
      setAvailability(existing.availability);
      setIsActive(existing.is_active);
      setIsFeatured(existing.is_featured);
      setImages(
        existing.images.map((i) => ({
          image_url: i.image_url,
          sort_order: i.sort_order,
          is_primary: i.is_primary,
        })),
      );
      setTiers(
        existing.price_tiers.length > 0
          ? existing.price_tiers.map((t) => ({
              min_qty: t.min_qty,
              unit_price: t.unit_price,
            }))
          : [{ min_qty: existing.moq, unit_price: 0 }],
      );
      setSpecs(
        existing.specs.map((s) => ({
          label_en: s.label_en,
          label_ur: s.label_ur ?? '',
          value_en: s.value_en,
          value_ur: s.value_ur ?? '',
          sort_order: s.sort_order,
        })),
      );
    }
  }, [existing]);

  const validateSlabs = (): boolean => {
    if (tiers.length === 0) {
      setSlabError('At least one price slab is required.');
      return false;
    }
    const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
    if (sorted[0].min_qty !== moq) {
      setSlabError(`The lowest slab minimum quantity must equal MOQ (${moq}).`);
      return false;
    }
    const seen = new Set<number>();
    for (const t of sorted) {
      if (!Number.isInteger(t.min_qty) || t.min_qty < 1) {
        setSlabError('All slab quantities must be positive integers.');
        return false;
      }
      if (seen.has(t.min_qty)) {
        setSlabError('Slab minimum quantities must be unique.');
        return false;
      }
      seen.add(t.min_qty);
      if (Number.isNaN(t.unit_price) || t.unit_price < 0) {
        setSlabError('Unit prices must be 0 or greater.');
        return false;
      }
    }
    setSlabError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryId || !nameEn.trim() || !slug.trim() || !sku.trim()) {
      setFormError('Category, Name (EN), Slug, and SKU are required.');
      return;
    }
    if (moq < 1) {
      setFormError('MOQ must be at least 1.');
      return;
    }
    if (!validateSlabs()) return;

    setSaving(true);
    try {
      await saveProduct(
        {
          category_id: categoryId,
          slug: slugify(slug),
          sku: sku.trim(),
          name_en: nameEn.trim(),
          name_ur: nameUr.trim() || null,
          short_desc_en: shortDescEn.trim() || null,
          short_desc_ur: shortDescUr.trim() || null,
          moq,
          availability,
          is_active: isActive,
          is_featured: isFeatured,
          images,
          price_tiers: [...tiers].sort((a, b) => a.min_qty - b.min_qty),
          specs: specs
            .filter((s) => s.label_en.trim() && s.value_en.trim())
            .map((s, idx) => ({
              label_en: s.label_en.trim(),
              label_ur: s.label_ur.trim() || null,
              value_en: s.value_en.trim(),
              value_ur: s.value_ur.trim() || null,
              sort_order: idx + 1,
            })),
        },
        id,
      );
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
      showToast(isEdit ? 'Product saved' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loadingProduct) {
    return (
      <AdminLayout title="Loading Product...">
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Basic Info */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name (English)"
              required
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                if (!isEdit) setSlug(slugify(e.target.value));
              }}
            />
            <Input
              label="Product Name (Urdu)"
              dir="rtl"
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </Select>

            <Input
              label="SKU / Model Code"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SC5 VA-1260"
            />

            <Input
              label="URL Slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Short Description (English)"
              rows={3}
              value={shortDescEn}
              onChange={(e) => setShortDescEn(e.target.value)}
            />
            <Textarea
              label="Short Description (Urdu)"
              dir="rtl"
              rows={3}
              value={shortDescUr}
              onChange={(e) => setShortDescUr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Minimum Order Qty (MOQ)"
              type="number"
              min={1}
              required
              value={moq}
              onChange={(e) => {
                const nextMoq = Math.max(1, parseInt(e.target.value, 10) || 1);
                setMoq(nextMoq);
                if (tiers.length > 0 && !isEdit) {
                  setTiers((prev) =>
                    prev.map((t, i) => (i === 0 ? { ...t, min_qty: nextMoq } : t)),
                  );
                }
              }}
            />

            <Select
              label="Availability"
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as AvailabilityStatus)
              }
            >
              <option value="in_stock">In Stock</option>
              <option value="made_to_order">Made to Order</option>
              <option value="out_of_stock">Out of Stock</option>
            </Select>

            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent-green)]"
                />
                <span>Active (Public)</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[var(--brand-red)]"
                />
                <span>Featured on Home</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-3">
          <h2 className="text-base font-bold text-[var(--ink)]">Product Photos</h2>
          <ImageUploader
            images={images}
            onChange={setImages}
            pathPrefix={`products/${id || 'new'}`}
          />
        </div>

        {/* Price Slabs */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6">
          <PriceSlabEditor
            tiers={tiers}
            moq={moq}
            onChange={setTiers}
            error={slabError}
          />
        </div>

        {/* Technical Specs */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6">
          <SpecsEditor specs={specs} onChange={setSpecs} />
        </div>

        {formError && (
          <p className="text-sm font-medium text-[var(--brand-red)]" role="alert">
            {formError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/products">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            {saving ? 'Saving Product...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
