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
  const { totalCount, lastAddedAt } = useQuote();
  const { data: settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);

  const siteName = pickSetting(settings, 'site_name', lang, t('common.brandName'));
  const logoUrl = pickSetting(settings, 'logo_url', 'en', '');

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!lastAddedAt) return;
    setCartAnimating(true);
    const id = window.setTimeout(() => setCartAnimating(false), 450);
    return () => window.clearTimeout(id);
  }, [lastAddedAt]);

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products') },
    { to: '/track', label: t('nav.track') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-[var(--line)] shadow-[0_6px_24px_-12px_rgba(20,20,26,0.14)]'
          : 'bg-white/95 backdrop-blur-xs border-[var(--line)]'
      }`}
    >
      {/* 4px Crimson Gradient Top Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--brand-red-dark)] via-[var(--brand-red)] to-[var(--brand-red-dark)]" />

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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--accent-green)] bg-white text-[var(--brand-red)] font-heading font-bold text-sm shadow-xs">
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
                `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
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
            className={`relative inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[var(--line)] bg-white text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
              cartAnimating ? 'border-[var(--brand-red)]/60 -translate-y-0.5' : ''
            }`}
          >
            <span className="relative inline-flex items-center justify-center">
              <ClipboardList
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  cartAnimating ? 'scale-115 text-[var(--brand-red)]' : ''
                }`}
              />
              {cartAnimating && (
                <span
                  aria-hidden="true"
                  className="asatek-cart-fly absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-red)]"
                />
              )}
            </span>
            <span className="hidden sm:inline">{t('nav.quote')}</span>
            <span
              key={lastAddedAt}
              data-testid="quote-count-badge"
              className={`inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-red-dark)] text-white text-xs font-semibold tabular-nums ${
                lastAddedAt > 0 ? 'asatek-cart-pop' : ''
              }`}
            >
              {totalCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[var(--line)] bg-white/95 backdrop-blur-md px-4 py-3 space-y-1 asatek-modal-panel"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
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
