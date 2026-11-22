import { useI18n } from '../../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div
      className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] p-0.5 text-xs font-medium shrink-0"
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'en'
            ? 'bg-white text-[var(--brand-red)] shadow-xs font-semibold'
            : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        aria-pressed={lang === 'ur'}
        className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'ur'
            ? 'bg-white text-[var(--brand-red)] shadow-xs font-semibold'
            : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
        }`}
      >
        اردو
      </button>
    </div>
  );
}
