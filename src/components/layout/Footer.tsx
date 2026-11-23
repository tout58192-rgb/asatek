import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Youtube } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

export function Footer() {
  const { lang, t } = useI18n();
  const { data: settings } = useSettings();

  const brandFull = pickSetting(settings, 'about_title', lang, t('common.brandFull'));
  const tagline = pickSetting(settings, 'tagline', lang, '');
  const address = pickSetting(settings, 'address', lang, '');
  const phone = pickSetting(settings, 'phone', lang, '');
  const email = pickSetting(settings, 'email', 'en', '');
  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');
  const youtubeUrl = pickSetting(settings, 'youtube_url', 'en', '');
  const facebookUrl = pickSetting(settings, 'facebook_url', 'en', '');
  const instagramUrl = pickSetting(settings, 'instagram_url', 'en', '');

  const whatsappHref = whatsappNumber
    ? buildWhatsAppLink(whatsappNumber, 'Assalam o Alaikum ASATEK, I have a wholesale inquiry.')
    : '#';

  return (
    <footer className="bg-[var(--ink)] text-white relative">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--brand-red-dark)] via-[var(--brand-red)] to-[var(--brand-red-dark)]" />
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--accent-green)] bg-white text-[var(--brand-red)] font-heading font-bold text-sm">
                A
              </span>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                {brandFull}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              {tagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ASATEK YouTube Channel"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4 text-[var(--brand-red)]" />
                  <span>YouTube</span>
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Facebook
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition-colors">
                  {t('nav.quote')}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  {t('nav.track')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Factory Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-4">
              {t('footer.contactTitle')}
            </h3>
            {address && (
              <p className="flex items-start gap-2.5 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-[var(--brand-red)] shrink-0 mt-1" />
                <span>{address}</span>
              </p>
            )}
            {phone && (
              <p className="flex items-center gap-2.5 text-sm text-gray-300 tabular-nums">
                <Phone className="w-4 h-4 text-[var(--brand-red)] shrink-0" />
                <span dir="ltr">{phone}</span>
              </p>
            )}
            {email && (
              <p className="flex items-center gap-2.5 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-[var(--brand-red)] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </p>
            )}
            {whatsappNumber && (
              <div className="pt-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--whatsapp)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--whatsapp-dark)] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{t('footer.whatsappAction')}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
