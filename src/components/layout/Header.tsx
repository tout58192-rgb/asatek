import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ClipboardList, Menu, X } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';
import { useQuote } from '../../contexts/QuoteContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { lang, t } = useI18n();
  const { totalCount } = useQuote();
  const { data: settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const siteName = pickSetting(settings, 'site_name', lang, t('common.brandName'));
  const logoUrl = pickSetting(settings, 'logo_url', 'en', '');

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products') },
    { to: '/track', label: t('nav.track') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--line)]">
      {/* 4px Red Top Strip */}
      <div className="h-1 w-full bg-[var(--brand-red)]" />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-red)] rounded"
        >
          {logoUrl && !logoFailed ? (
            <img
              src={logoUrl}
              alt={siteName}
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="h-9 w-9 rounded-full object-contain border border-[var(--line)]"
            />
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--accent-green)] bg-white text-[var(--brand-red)] font-heading font-bold text-sm">
              A
            </span>
          )}
          <span className="font-heading text-xl font-bold tracking-tight text-[var(--brand-red)] whitespace-nowrap">
            {siteName}
          </span>
        </Link>

        {/* Zone 2: Primary Nav Links (Desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'text-[var(--brand-red)] border-[var(--brand-red)]'
                    : 'text-[var(--ink-soft)] border-transparent hover:text-[var(--ink)] hover:border-[var(--line)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Language Switcher + Order List CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LanguageSwitcher />

          <Link
            to="/quote"
            aria-label={`${t('nav.quote')} (${totalCount})`}
            className="relative inline-flex items-center gap-2 min-h-[40px] px-3 py-1.5 rounded-lg border border-[var(--line)] bg-white text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] transition-colors whitespace-nowrap shrink-0"
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t('nav.quote')}</span>
            <span
              data-testid="quote-count-badge"
              className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-[var(--brand-red)] text-white text-xs font-semibold tabular-nums"
            >
              {totalCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-alt)] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[var(--line)] bg-white px-4 py-3 space-y-1"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-[var(--brand-red-light)] text-[var(--brand-red)]'
                    : 'text-[var(--ink)] hover:bg-[var(--bg-alt)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
