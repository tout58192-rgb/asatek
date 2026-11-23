import type { Lang } from './i18n';

export const INTRO_STORAGE_KEY = 'asatek_intro_seen';

export type HeroHeadingMode =
  | 'none'
  | 'fade-up'
  | 'typewriter-en'
  | 'words-ur';

export function hasSeenIntro(storage?: Pick<Storage, 'getItem'> | null): boolean {
  try {
    const target =
      storage ??
      (typeof window !== 'undefined' ? window.sessionStorage : null);
    return target?.getItem(INTRO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen(storage?: Pick<Storage, 'setItem'> | null): void {
  try {
    const target =
      storage ??
      (typeof window !== 'undefined' ? window.sessionStorage : null);
    target?.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Ignore restricted storage errors (private mode / sandboxed iframe)
  }
}

/**
 * Splits a heading into leading text and the final highlighted word.
 * Preserves whitespace safely and keeps single-word headings intact.
 */
export function splitHeadingHighlight(text: string): {
  leading: string;
  highlight: string;
} {
  const normalized = text.trim();
  if (!normalized) {
    return { leading: '', highlight: '' };
  }

  const lastSpaceIdx = normalized.lastIndexOf(' ');
  if (lastSpaceIdx <= 0) {
    return { leading: '', highlight: normalized };
  }

  return {
    leading: normalized.slice(0, lastSpaceIdx + 1),
    highlight: normalized.slice(lastSpaceIdx + 1),
  };
}

/**
 * Splits Urdu/RTL headings strictly by whole words so joined Arabic-script
 * characters are never broken into disconnected letters.
 */
export function splitUrduWords(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter(Boolean);
}

/**
 * Computes per-step delay (ms) for English typewriter or Urdu word-by-word reveal.
 * Short replay on language switch keeps transitions brisk for returning visitors.
 */
export function getStepDelayMs(
  lang: Lang,
  count: number,
  isLanguageSwitch: boolean,
): number {
  if (count <= 0) return 0;
  if (lang === 'ur') {
    return isLanguageSwitch ? 65 : 120;
  }
  if (!isLanguageSwitch) {
    return 45;
  }
  // Short version on language switch: ~22ms/letter, capped at ~550ms total
  return Math.max(12, Math.min(24, Math.floor(550 / count)));
}

export function getHeadingAnimationMode(params: {
  reducedMotion: boolean;
  isFirstVisit: boolean;
  isLanguageSwitch: boolean;
  lang: Lang;
}): HeroHeadingMode {
  if (params.reducedMotion) return 'none';
  if (!params.isFirstVisit && !params.isLanguageSwitch) return 'fade-up';
  return params.lang === 'ur' ? 'words-ur' : 'typewriter-en';
}
