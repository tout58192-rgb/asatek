import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import { useCategories } from '../../hooks/useCategories';
import { slugify } from '../../lib/format';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../../services/categories';
import type { Category } from '../../types/db';

const ICON_OPTIONS = [
  'Zap',
  'Sun',
  'PlugZap',
  'BatteryCharging',
  'Component',
  'Fan',
  'Cpu',
  'CircuitBoard',
];

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories(true);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Component');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setNameEn('');
    setNameUr('');
    setSlug('');
    setIcon('Component');
    setImageUrl('');
    setSortOrder((categories?.length ?? 0) + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setNameEn(cat.name_en);
    setNameUr(cat.name_ur ?? '');
    setSlug(cat.slug);
    setIcon(cat.icon || 'Component');
    setImageUrl(cat.image_url ?? '');
    setSortOrder(cat.sort_order);
    setIsActive(cat.is_active);
    setModalOpen(true);
  };

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !slug.trim()) {
      showToast('Category Name (EN) and Slug are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name_en: nameEn.trim(),
        name_ur: nameUr.trim() || null,
        slug: slugify(slug),
        icon,
        image_url: imageUrl.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
      };

      if (editing) {
        await updateCategory(editing.id, payload);
        showToast('Category updated');
      } else {
        await createCategory(payload);
        showToast('Category created');
      }
      await invalidate();
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (idx: number, delta: -1 | 1) => {
    if (!categories) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    const current = categories[idx];
    const swap = categories[targetIdx];

    try {
      await updateCategory(current.id, { sort_order: swap.sort_order });
      await updateCategory(swap.id, { sort_order: current.sort_order });
      await invalidate();
    } catch {
      showToast('Could not reorder category', 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      await invalidate();
      showToast('Category deleted');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Could not delete category',
        'error',
      );
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Order</th>
                  <th className="px-4 py-3 text-start">Category</th>
                  <th className="px-4 py-3 text-start">Urdu Name</th>
                  <th className="px-4 py-3 text-start">Slug</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <TableRowSkeleton cols={6} />
                    <TableRowSkeleton cols={6} />
                  </>
                ) : (categories ?? []).map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className="border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/50"
                  >
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-mono-num w-6 text-xs text-[var(--ink-soft)]">
                          {cat.sort_order}
                        </span>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          aria-label={`Move ${cat.name_en} up`}
                          className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (categories?.length ?? 1) - 1}
                          onClick={() => handleMove(idx, 1)}
                          aria-label={`Move ${cat.name_en} down`}
                          className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 font-medium text-[var(--ink)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-red-light)] text-[var(--brand-red)]">
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </span>
                        <span>{cat.name_en}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" dir="rtl">
                      {cat.name_ur || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono-num text-xs text-[var(--ink-soft)]">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3">
                      {cat.is_active ? (
                        <Badge tone="green">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          aria-label={`Edit ${cat.name_en}`}
                          className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--bg-alt)] cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          aria-label={`Delete ${cat.name_en}`}
                          className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] rounded-lg hover:bg-[var(--brand-red-light)] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Name (English)"
            required
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (!editing) {
                setSlug(slugify(e.target.value));
              }
            }}
          />

          <Input
            label="Name (Urdu)"
            dir="rtl"
            value={nameUr}
            onChange={(e) => setNameUr(e.target.value)}
          />

          <Input
            label="Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>

            <Input
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(parseInt(e.target.value, 10) || 0)
              }
            />
          </div>

          <Input
            label="Image URL (Optional)"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />

          <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--ink)] cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[var(--brand-red)]"
            />
            <span>Active (visible on storefront)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
