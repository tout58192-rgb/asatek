import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { SiteSettingRow, SiteSettingsMap } from '../types/db';
import { mockStore, saveMockStore } from './mockData';

const SETTINGS_CACHE_KEY = 'asatek_cache_settings_v1';

export function getCachedSiteSettings(): SiteSettingsMap | undefined {
  if (!isSupabaseConfigured) return undefined;
  if (typeof window === 'undefined' || !window.localStorage) return undefined;
  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as SiteSettingsMap;
  } catch {
    return undefined;
  }
}

function setCachedSiteSettings(map: SiteSettingsMap): void {
  if (!isSupabaseConfigured) return;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  if (!isSupabaseConfigured || !supabase) {
    return { ...mockStore.settings };
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value_en, value_ur');
  if (error) throw error;

  const map: SiteSettingsMap = {};
  for (const row of (data ?? []) as SiteSettingRow[]) {
    map[row.key] = {
      value_en: row.value_en ?? '',
      value_ur: row.value_ur ?? '',
    };
  }
  setCachedSiteSettings(map);
  return map;
}

export async function saveSiteSettings(
  updates: Array<{ key: string; value_en: string; value_ur?: string }>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    for (const row of updates) {
      mockStore.settings[row.key] = {
        value_en: row.value_en,
        value_ur: row.value_ur ?? mockStore.settings[row.key]?.value_ur ?? '',
      };
    }
    saveMockStore();
    return;
  }

  const payload = updates.map((u) => ({
    key: u.key,
    value_en: u.value_en,
    value_ur: u.value_ur ?? null,
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' });
  if (error) throw error;

  const cached = getCachedSiteSettings() ?? {};
  for (const u of updates) {
    cached[u.key] = {
      value_en: u.value_en,
      value_ur: u.value_ur ?? cached[u.key]?.value_ur ?? '',
    };
  }
  setCachedSiteSettings(cached);
}
