import { useEffect, useState } from 'react';
import { Factory, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useI18n } from '../contexts/LanguageContext';
import { useSettings } from '../hooks/useSettings';
import { pickSetting } from '../lib/i18n';

const SERVICE_CITIES = [
  'Sadiqabad',
  'Karachi',
  'Hyderabad',
  'Bahawalpur',
  'Lahore',
  'Rawalpindi',
  'Peshawar',
];

export default function About() {
  const { lang, t } = useI18n();
  const { data: settings } = useSettings();
  const [imgFailed, setImgFailed] = useState(false);

  const aboutTitle = pickSetting(
    settings,
    'about_title',
    lang,
    t('common.brandFull'),
  );
  const aboutBody = pickSetting(settings, 'about_body', lang, '');
  const aboutImage = pickSetting(settings, 'about_image_url', 'en', '');
  const address = pickSetting(settings, 'address', lang, '');

  useEffect(() => {
    setImgFailed(false);
  }, [aboutImage]);

  const capabilities = [
    { icon: ShieldCheck, title: t('about.cap1Title'), desc: t('about.cap1Desc') },
    { icon: Factory, title: t('about.cap2Title'), desc: t('about.cap2Desc') },
    { icon: Wrench, title: t('about.cap3Title'), desc: t('about.cap3Desc') },
  ];

  return (
    <Layout title={t('nav.about')} description={t('about.subtitle')}>
      <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            {t('about.title')}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[var(--ink-soft)]">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 space-y-14">
        {/* Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--brand-red-dark)]">
              {aboutTitle}
            </h2>
            <p className="text-base text-[var(--ink-soft)] leading-relaxed whitespace-pre-line">
              {aboutBody}
            </p>
            {address && (
              <p className="flex items-start gap-2 text-sm text-[var(--ink)] font-medium pt-2">
                <MapPin className="w-4 h-4 text-[var(--brand-red)] shrink-0 mt-1" />
                <span>{address}</span>
              </p>
            )}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="primary">{t('common.browseProducts')}</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary">{t('nav.contact')}</Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            {aboutImage && !imgFailed ? (
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--bg-alt)]">
                <img
                  src={aboutImage}
                  alt={aboutTitle}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-red-light)] text-[var(--brand-red)]">
                  <Factory className="w-8 h-8" />
                </div>
                <p className="font-heading text-lg font-bold text-[var(--ink)]">
                  {aboutTitle}
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  Sadiqabad, Punjab · Pakistan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Capabilities */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--ink)]">
            {t('about.capabilitiesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-red-light)] text-[var(--brand-red)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Service Network */}
        <section className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-[var(--ink)]">
            {t('about.serviceTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed max-w-3xl">
            {t('about.serviceDesc')}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm font-medium text-[var(--ink)]">
            {SERVICE_CITIES.map((city, idx) => (
              <span key={city} className="inline-flex items-center gap-4">
                <span>{city}</span>
                {idx < SERVICE_CITIES.length - 1 && (
                  <span className="text-gray-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
