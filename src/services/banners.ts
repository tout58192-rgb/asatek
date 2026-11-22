import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { HomeBanner } from '../types/db';
import { mockStore, saveMockStore } from './mockData';
import { deleteStorageImageByPublicUrl } from './storage';

export type HomeBannerInput = Omit<HomeBanner, 'id'>;

export async function listBanners(includeInactive = false): Promise<HomeBanner[]> {
  if (!isSupabaseConfigured || !supabase) {
    const list = includeInactive
      ? mockStore.banners
      : mockStore.banners.filter((b) => b.is_active);
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  }

  let query = supabase
    .from('home_banners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as HomeBanner[];
}

export async function createBanner(input: HomeBannerInput): Promise<HomeBanner> {
  if (!isSupabaseConfigured || !supabase) {
    const created: HomeBanner = {
      ...input,
      id: `banner-${Date.now()}`,
    };
    mockStore.banners.push(created);
    saveMockStore();
    return created;
  }

  const { data, error } = await supabase
    .from('home_banners')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as HomeBanner;
}

export async function updateBanner(
  id: string,
  input: Partial<HomeBannerInput>,
): Promise<HomeBanner> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockStore.banners.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Banner not found');
    const updated: HomeBanner = {
      ...mockStore.banners[idx],
      ...input,
    };
    mockStore.banners[idx] = updated;
    saveMockStore();
    return updated;
  }

  const { data, error } = await supabase
    .from('home_banners')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as HomeBanner;
}

export async function deleteBanner(banner: Pick<HomeBanner, 'id' | 'image_url'>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockStore.banners = mockStore.banners.filter((b) => b.id !== banner.id);
    saveMockStore();
    return;
  }

  const { error } = await supabase
    .from('home_banners')
    .delete()
    .eq('id', banner.id);
  if (error) throw error;

  if (banner.image_url) {
    await deleteStorageImageByPublicUrl(banner.image_url);
  }
}
