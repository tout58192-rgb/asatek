import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Category } from '../types/db';
import { mockStore, saveMockStore } from './mockData';

export async function listCategories(includeInactive = false): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) {
    const list = includeInactive
      ? mockStore.categories
      : mockStore.categories.filter((c) => c.is_active);
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  }

  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

export type CategoryInput = {
  slug: string;
  name_en: string;
  name_ur?: string | null;
  icon?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function createCategory(input: CategoryInput): Promise<Category> {
  if (!isSupabaseConfigured || !supabase) {
    const now = new Date().toISOString();
    const created: Category = {
      id: `cat-${Date.now()}`,
      slug: input.slug,
      name_en: input.name_en,
      name_ur: input.name_ur ?? null,
      icon: input.icon ?? 'Component',
      image_url: input.image_url ?? null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      created_at: now,
      updated_at: now,
    };
    mockStore.categories.push(created);
    saveMockStore();
    return created;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockStore.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const updated: Category = {
      ...mockStore.categories[idx],
      ...input,
      updated_at: new Date().toISOString(),
    };
    mockStore.categories[idx] = updated;
    saveMockStore();
    return updated;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const hasProducts = mockStore.products.some((p) => p.category_id === id);
    if (hasProducts) {
      throw new Error('Move or delete its products first');
    }
    mockStore.categories = mockStore.categories.filter((c) => c.id !== id);
    saveMockStore();
    return;
  }

  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    throw new Error('Move or delete its products first');
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
