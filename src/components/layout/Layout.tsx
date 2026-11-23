import React, { useEffect } from 'react';
import { useI18n } from '../../contexts/LanguageContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Footer } from './Footer';
import { Header } from './Header';
import { WhatsAppFloat } from './WhatsAppFloat';

interface LayoutProps {
  title?: string;
  description?: string;
  noindex?: boolean;
  children: React.ReactNode;
}

export function Layout({ title, description, noindex = false, children }: LayoutProps) {
  const { t } = useI18n();
  const { data: settings } = useSettings();
  const faviconUrl = pickSetting(settings, 'favicon_url', 'en', '');

  useEffect(() => {
    const baseTitle = 'ASATEK Power Link';
    document.title = title ? `${title} — ${baseTitle}` : `${baseTitle} — Wholesale Power Electronics`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    let robots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, noindex]);

  useEffect(() => {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl || '/favicon.svg';
  }, [faviconUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      {!isSupabaseConfigured && (
        <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] px-4 py-1.5 text-center text-xs text-[var(--ink-soft)]">
          {t('common.demoBanner')}
        </div>
      )}
      <Header />
      <main className="flex-1 asatek-page-enter">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
