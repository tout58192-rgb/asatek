export type Lang = 'en' | 'ur';

export function pick(
  obj: Record<string, unknown> | null | undefined,
  field: string,
  lang: Lang,
): string {
  if (!obj) return '';
  if (lang === 'ur') {
    const ur = obj[`${field}_ur`];
    if (typeof ur === 'string' && ur.trim().length > 0) {
      return ur;
    }
  }
  const en = obj[`${field}_en`];
  return typeof en === 'string' ? en : '';
}

export function pickSetting(
  settings: Record<string, { value_en: string; value_ur: string }> | undefined,
  key: string,
  lang: Lang,
  fallback = '',
): string {
  if (!settings || !settings[key]) return fallback;
  const entry = settings[key];
  if (lang === 'ur' && entry.value_ur && entry.value_ur.trim().length > 0) {
    return entry.value_ur;
  }
  return entry.value_en || fallback;
}
