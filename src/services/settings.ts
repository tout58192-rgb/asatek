import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { SiteSettingRow, SiteSettingsMap } from '../types/db';
import { mockStore, saveMockStore } from './mockData';

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  if (!isSupabaseConfigured || !supabase) {
    return { ...mockStore.settings };
  }

  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;

  const map: SiteSettingsMap = {};
  for (const row of (data ?? []) as SiteSettingRow[]) {
    map[row.key] = {
      value_en: row.value_en ?? '',
      value_ur: row.value_ur ?? '',
    };
  }
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
}
