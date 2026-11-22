import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import enDict from '../locales/en.json';
import urDict from '../locales/ur.json';
import { pick as pickField, type Lang } from '../lib/i18n';

const STORAGE_KEY = 'asatek_lang';

type Dict = Record<string, unknown>;
const dicts: Record<Lang, Dict> = {
  en: enDict as Dict,
  ur: urDict as Dict,
};

function resolveKey(dict: Dict, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Dict)) {
      current = (current as Dict)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface LanguageContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (next: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  pick: (obj: Record<string, unknown> | null | undefined, field: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'ur' || paramLang === 'en') {
      return paramLang;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ur' || stored === 'en') {
      return stored;
    }
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const dir: 'ltr' | 'rtl' = lang === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'ur' : 'en'));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text =
        resolveKey(dicts[lang], key) ?? resolveKey(dicts.en, key) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [lang],
  );

  const pick = useCallback(
    (obj: Record<string, unknown> | null | undefined, field: string): string =>
      pickField(obj, field, lang),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t, pick }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside LanguageProvider');
  }
  return ctx;
}
