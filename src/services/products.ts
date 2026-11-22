import { getLowestUnitPrice, sortTiers } from '../lib/pricing';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  AvailabilityStatus,
  Category,
  PaginatedResult,
  ProductImage,
  ProductListParams,
  ProductPriceTier,
  ProductSpec,
  ProductWithDetails,
} from '../types/db';
import { mockStore, saveMockStore } from './mockData';
import { deleteStorageImageByPublicUrl } from './storage';

function attachCategory(
  product: ProductWithDetails,
  categories: Category[],
): ProductWithDetails {
  const category = categories.find((c) => c.id === product.category_id) ?? null;
  return {
    ...product,
    category,
    images: [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(product.price_tiers ?? []),
    specs: [...(product.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function listProducts(
  params: ProductListParams = {},
): Promise<PaginatedResult<ProductWithDetails>> {
  const {
    categorySlug,
    q,
    sort = 'newest',
    page = 1,
    pageSize = 24,
    includeInactive = false,
  } = params;

  if (!isSupabaseConfigured || !supabase) {
    let items = mockStore.products.map((p) => attachCategory(p, mockStore.categories));
    if (!includeInactive) {
      items = items.filter((p) => p.is_active && p.category?.is_active !== false);
    }
    if (categorySlug) {
      items = items.filter((p) => p.category?.slug === categorySlug);
    }
    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name_en.toLowerCase().includes(needle) ||
          (p.name_ur ?? '').toLowerCase().includes(needle) ||
          p.sku.toLowerCase().includes(needle),
      );
    }

    if (sort === 'name_asc') {
      items.sort((a, b) => a.name_en.localeCompare(b.name_en));
    } else if (sort === 'price_asc') {
      items.sort((a, b) => {
        const pa = getLowestUnitPrice(a.price_tiers) ?? Number.MAX_SAFE_INTEGER;
        const pb = getLowestUnitPrice(b.price_tiers) ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else {
      items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, total, page, pageSize };
  }

  let categoryIdFilter: string | null = null;
  if (categorySlug) {
    const { data: catData, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!catData) {
      return { items: [], total: 0, page, pageSize };
    }
    categoryIdFilter = catData.id;
  }

  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
      { count: 'exact' },
    );

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  if (categoryIdFilter) {
    query = query.eq('category_id', categoryIdFilter);
  }
  if (q && q.trim()) {
    const safeQ = q.trim().replace(/[,%]/g, '');
    query = query.or(
      `name_en.ilike.%${safeQ}%,name_ur.ilike.%${safeQ}%,sku.ilike.%${safeQ}%`,
    );
  }

  if (sort === 'name_asc') {
    query = query.order('name_en', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (sort === 'price_asc') {
    const { data, error, count } = await query;
    if (error) throw error;
    const normalized = ((data ?? []) as ProductWithDetails[]).map((p) => ({
      ...p,
      images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      price_tiers: sortTiers(p.price_tiers ?? []),
      specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    }));
    normalized.sort((a, b) => {
      const pa = getLowestUnitPrice(a.price_tiers) ?? Number.MAX_SAFE_INTEGER;
      const pb = getLowestUnitPrice(b.price_tiers) ?? Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
    const start = (page - 1) * pageSize;
    return {
      items: normalized.slice(start, start + pageSize),
      total: count ?? normalized.length,
      page,
      pageSize,
    };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = ((data ?? []) as ProductWithDetails[]).map((p) => ({
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
  };
}

export async function listFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured || !supabase) {
    const featured = mockStore.products.filter((p) => p.is_active && p.is_featured);
    const list =
      featured.length > 0
        ? featured
        : mockStore.products.filter((p) => p.is_active);
    return list
      .slice(0, limit)
      .map((p) => attachCategory(p, mockStore.categories));
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  let rows = (data ?? []) as ProductWithDetails[];

  if (rows.length === 0) {
    const { data: latestData, error: latestError } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        price_tiers:product_price_tiers(*),
        specs:product_specs(*)
      `,
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (latestError) throw latestError;
    rows = (latestData ?? []) as ProductWithDetails[];
  }

  return rows.map((p) => ({
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured || !supabase) {
    const found = mockStore.products.find((p) => p.slug === slug && p.is_active);
    return found ? attachCategory(found, mockStore.categories) : null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const p = data as ProductWithDetails;
  return {
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured || !supabase) {
    const found = mockStore.products.find((p) => p.id === id);
    return found ? attachCategory(found, mockStore.categories) : null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const p = data as ProductWithDetails;
  return {
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getProductsByIds(ids: string[]): Promise<ProductWithDetails[]> {
  if (ids.length === 0) return [];
  if (!isSupabaseConfigured || !supabase) {
    return mockStore.products
      .filter((p) => ids.includes(p.id))
      .map((p) => attachCategory(p, mockStore.categories));
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
    )
    .in('id', ids);

  if (error) throw error;
  return ((data ?? []) as ProductWithDetails[]).map((p) => ({
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function listRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockStore.products
      .filter(
        (p) =>
          p.is_active &&
          p.category_id === categoryId &&
          p.id !== excludeProductId,
      )
      .slice(0, limit)
      .map((p) => attachCategory(p, mockStore.categories));
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      price_tiers:product_price_tiers(*),
      specs:product_specs(*)
    `,
    )
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as ProductWithDetails[]).map((p) => ({
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: sortTiers(p.price_tiers ?? []),
    specs: [...(p.specs ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export interface ProductSaveInput {
  category_id: string;
  slug: string;
  sku: string;
  name_en: string;
  name_ur?: string | null;
  short_desc_en?: string | null;
  short_desc_ur?: string | null;
  moq: number;
  availability: AvailabilityStatus;
  is_active: boolean;
  is_featured: boolean;
  images: Array<{ image_url: string; sort_order: number; is_primary: boolean }>;
  price_tiers: Array<{ min_qty: number; unit_price: number }>;
  specs: Array<{
    label_en: string;
    label_ur?: string | null;
    value_en: string;
    value_ur?: string | null;
    sort_order: number;
  }>;
}

export async function saveProduct(
  input: ProductSaveInput,
  existingId?: string,
): Promise<ProductWithDetails> {
  if (!isSupabaseConfigured || !supabase) {
    const now = new Date().toISOString();
    const id = existingId || `prod-${Date.now()}`;
    const images: ProductImage[] = input.images.map((img, i) => ({
      id: `img-${id}-${i}`,
      product_id: id,
      image_url: img.image_url,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    }));
    const price_tiers: ProductPriceTier[] = input.price_tiers.map((t, i) => ({
      id: `tier-${id}-${i}`,
      product_id: id,
      min_qty: t.min_qty,
      unit_price: t.unit_price,
    }));
    const specs: ProductSpec[] = input.specs.map((s, i) => ({
      id: `spec-${id}-${i}`,
      product_id: id,
      label_en: s.label_en,
      label_ur: s.label_ur ?? null,
      value_en: s.value_en,
      value_ur: s.value_ur ?? null,
      sort_order: s.sort_order,
    }));

    const existingIdx = mockStore.products.findIndex((p) => p.id === id);
    const saved: ProductWithDetails = {
      id,
      category_id: input.category_id,
      slug: input.slug,
      sku: input.sku,
      name_en: input.name_en,
      name_ur: input.name_ur ?? null,
      short_desc_en: input.short_desc_en ?? null,
      short_desc_ur: input.short_desc_ur ?? null,
      moq: input.moq,
      availability: input.availability,
      is_active: input.is_active,
      is_featured: input.is_featured,
      created_at: existingIdx >= 0 ? mockStore.products[existingIdx].created_at : now,
      updated_at: now,
      images,
      price_tiers,
      specs,
    };

    if (existingIdx >= 0) {
      mockStore.products[existingIdx] = saved;
    } else {
      mockStore.products.unshift(saved);
    }
    saveMockStore();
    return attachCategory(saved, mockStore.categories);
  }

  const basePayload = {
    category_id: input.category_id,
    slug: input.slug,
    sku: input.sku,
    name_en: input.name_en,
    name_ur: input.name_ur || null,
    short_desc_en: input.short_desc_en || null,
    short_desc_ur: input.short_desc_ur || null,
    moq: input.moq,
    availability: input.availability,
    is_active: input.is_active,
    is_featured: input.is_featured,
  };

  let productId = existingId;
  if (productId) {
    const { error } = await supabase
      .from('products')
      .update(basePayload)
      .eq('id', productId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw error;
    productId = data.id as string;
  }

  // Replace child rows cleanly
  await supabase.from('product_images').delete().eq('product_id', productId);
  if (input.images.length > 0) {
    const { error } = await supabase.from('product_images').insert(
      input.images.map((img, i) => ({
        product_id: productId,
        image_url: img.image_url,
        sort_order: img.sort_order ?? i,
        is_primary: Boolean(img.is_primary),
      })),
    );
    if (error) throw error;
  }

  await supabase.from('product_price_tiers').delete().eq('product_id', productId);
  if (input.price_tiers.length > 0) {
    const { error } = await supabase.from('product_price_tiers').insert(
      input.price_tiers.map((tier) => ({
        product_id: productId,
        min_qty: tier.min_qty,
        unit_price: tier.unit_price,
      })),
    );
    if (error) throw error;
  }

  await supabase.from('product_specs').delete().eq('product_id', productId);
  if (input.specs.length > 0) {
    const { error } = await supabase.from('product_specs').insert(
      input.specs.map((spec, i) => ({
        product_id: productId,
        label_en: spec.label_en,
        label_ur: spec.label_ur || null,
        value_en: spec.value_en,
        value_ur: spec.value_ur || null,
        sort_order: spec.sort_order ?? i,
      })),
    );
    if (error) throw error;
  }

  const full = await getProductById(productId);
  if (!full) throw new Error('Product saved but could not be reloaded');
  return full;
}

export async function toggleProductField(
  id: string,
  field: 'is_active' | 'is_featured',
  value: boolean,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockStore.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      mockStore.products[idx] = {
        ...mockStore.products[idx],
        [field]: value,
        updated_at: new Date().toISOString(),
      };
      saveMockStore();
    }
    return;
  }

  const { error } = await supabase
    .from('products')
    .update({ [field]: value })
    .eq('id', id);
  if (error) throw error;
}

export async function duplicateProduct(id: string): Promise<ProductWithDetails> {
  const source = await getProductById(id);
  if (!source) throw new Error('Product not found');
  const suffix = Math.floor(100 + Math.random() * 900);
  return saveProduct({
    category_id: source.category_id,
    slug: `${source.slug}-copy-${suffix}`,
    sku: `${source.sku}-COPY-${suffix}`,
    name_en: `${source.name_en} (Copy)`,
    name_ur: source.name_ur,
    short_desc_en: source.short_desc_en,
    short_desc_ur: source.short_desc_ur,
    moq: source.moq,
    availability: source.availability,
    is_active: false,
    is_featured: false,
    images: source.images.map((i) => ({
      image_url: i.image_url,
      sort_order: i.sort_order,
      is_primary: i.is_primary,
    })),
    price_tiers: source.price_tiers.map((t) => ({
      min_qty: t.min_qty,
      unit_price: t.unit_price,
    })),
    specs: source.specs.map((s) => ({
      label_en: s.label_en,
      label_ur: s.label_ur,
      value_en: s.value_en,
      value_ur: s.value_ur,
      sort_order: s.sort_order,
    })),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockStore.products = mockStore.products.filter((p) => p.id !== id);
    saveMockStore();
    return;
  }

  const { data: imgs } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id);

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;

  for (const row of (imgs ?? []) as Array<{ image_url: string }>) {
    await deleteStorageImageByPublicUrl(row.image_url);
  }
}
