import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Factory,
  ImageOff,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useI18n } from '../contexts/LanguageContext';
import { useBanners } from '../hooks/useBanners';
import { useCategories } from '../hooks/useCategories';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import { pickSetting } from '../lib/i18n';
import { buildWhatsAppLink } from '../lib/whatsapp';

export default function Home() {
  const { lang, t, pick } = useI18n();
  const { data: settings } = useSettings();
  const { data: banners } = useBanners();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: featured, isLoading: featLoading } = useFeaturedProducts(8);

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedCatImgs, setFailedCatImgs] = useState<Record<string, boolean>>({});
  const [failedBannerImgs, setFailedBannerImgs] = useState<Record<string, boolean>>({});
  const [bannerIdx, setBannerIdx] = useState(0);

  const heroTitle = pickSetting(
    settings,
    'hero_title',
    lang,
    'Factory-Direct Power Electronics',
  );
  const heroSubtitle = pickSetting(settings, 'hero_subtitle', lang, '');
  const heroImageUrl = pickSetting(settings, 'hero_image_url', 'en', '');
  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');
  const whatsappHref = whatsappNumber
    ? buildWhatsAppLink(
        whatsappNumber,
        'Assalam o Alaikum ASATEK, I would like wholesale rates and product availability.',
      )
    : '#';

  useEffect(() => {
    setHeroImgFailed(false);
  }, [heroImageUrl]);

  const activeBanners = banners ?? [];
  useEffect(() => {
    if (activeBanners.length > 0 && bannerIdx >= activeBanners.length) {
      setBannerIdx(0);
    }
  }, [activeBanners.length, bannerIdx]);

  const currentBanner = activeBanners[bannerIdx] ?? null;

  const trustItems = [
    {
      icon: Factory,
      title: t('home.why1Title'),
      desc: t('home.why1Desc'),
    },
    {
      icon: PackageCheck,
      title: t('home.why2Title'),
      desc: t('home.why2Desc'),
    },
    {
      icon: BadgeCheck,
      title: t('home.why3Title'),
      desc: t('home.why3Desc'),
    },
    {
      icon: Truck,
      title: t('home.why4Title'),
      desc: t('home.why4Desc'),
    },
  ];

  const steps = [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];

  return (
    <Layout
      title={t('nav.home')}
      description={heroSubtitle}
    >
      {/* Hero Section */}
      <section className="hero-circuit-bg text-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs sm:text-sm font-medium text-red-200 tracking-wide">
                {t('home.heroEyebrow')}
              </p>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/quote"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-[var(--brand-red)] text-white font-semibold text-sm sm:text-base hover:bg-[var(--brand-red-dark)] transition-colors shadow-sm"
                >
                  <span>{t('home.heroCtaPrimary')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                {whatsappNumber && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-[var(--whatsapp)] text-white font-semibold text-sm sm:text-base hover:bg-[var(--whatsapp-dark)] transition-colors shadow-sm"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>{t('home.heroCtaSecondary')}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Hero Visual Slot */}
            <div className="lg:col-span-5">
              {heroImageUrl && !heroImgFailed ? (
                <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-black/20">
                  <img
                    src={heroImageUrl}
                    alt={heroTitle}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="font-heading text-sm font-semibold text-white">
                      {t('common.brandFull')}
                    </span>
                    <span className="text-xs text-red-200 font-mono-num">
                      SC5 · SC6 · UPS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <Link
                      to="/products?category=solar"
                      className="rounded-lg border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-mono-num font-semibold text-white">SC5 VA-1260</p>
                      <p className="text-gray-300 mt-1">12V 60A PWM · 1000W</p>
                    </Link>
                    <Link
                      to="/products?category=solar"
                      className="rounded-lg border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-mono-num font-semibold text-white">SC5 VA-2460</p>
                      <p className="text-gray-300 mt-1">24V 60A PWM · 1400W</p>
                    </Link>
                    <Link
                      to="/products?category=solar"
                      className="rounded-lg border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-mono-num font-semibold text-white">SC6-1230</p>
                      <p className="text-gray-300 mt-1">12V 30A 3-in-1 · 500W</p>
                    </Link>
                    <Link
                      to="/products?category=ups"
                      className="rounded-lg border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-mono-num font-semibold text-white">UPS &amp; Parts</p>
                      <p className="text-gray-300 mt-1">Chargers · IGBT · PCB</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active Home Banners Showcase */}
      {currentBanner && (
        <section className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-8">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="relative rounded-2xl border border-[var(--line)] bg-white overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                <div className="md:col-span-7 aspect-[16/9] md:aspect-[16/8] bg-[var(--bg-alt)] overflow-hidden flex items-center justify-center">
                  {currentBanner.image_url && !failedBannerImgs[currentBanner.id] ? (
                    <img
                      src={currentBanner.image_url}
                      alt={pick(currentBanner as unknown as Record<string, unknown>, 'title') || 'ASATEK Banner'}
                      width={800}
                      height={450}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedBannerImgs((prev) => ({ ...prev, [currentBanner.id]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--ink-soft)] p-6">
                      <ImageOff className="w-8 h-8 opacity-50" />
                      <span className="text-xs font-medium">{t('common.brandFull')}</span>
                    </div>
                  )}
                </div>

                {(pick(currentBanner as unknown as Record<string, unknown>, 'title') ||
                  pick(currentBanner as unknown as Record<string, unknown>, 'subtitle') ||
                  (pick(currentBanner as unknown as Record<string, unknown>, 'button_text') &&
                    currentBanner.button_link)) && (
                  <div className="md:col-span-5 p-6 md:p-8 space-y-3">
                    {pick(currentBanner as unknown as Record<string, unknown>, 'title') && (
                      <h2 className="text-xl md:text-2xl font-bold text-[var(--ink)]">
                        {pick(currentBanner as unknown as Record<string, unknown>, 'title')}
                      </h2>
                    )}
                    {pick(currentBanner as unknown as Record<string, unknown>, 'subtitle') && (
                      <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed">
                        {pick(currentBanner as unknown as Record<string, unknown>, 'subtitle')}
                      </p>
                    )}
                    {pick(currentBanner as unknown as Record<string, unknown>, 'button_text') &&
                      currentBanner.button_link && (
                        <div className="pt-2">
                          {/^https?:\/\//i.test(currentBanner.button_link) ? (
                            <a
                              href={currentBanner.button_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-[var(--brand-red)] text-white text-sm font-semibold hover:bg-[var(--brand-red-dark)] transition-colors"
                            >
                              <span>
                                {pick(currentBanner as unknown as Record<string, unknown>, 'button_text')}
                              </span>
                              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                            </a>
                          ) : (
                            <Link
                              to={currentBanner.button_link}
                              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-[var(--brand-red)] text-white text-sm font-semibold hover:bg-[var(--brand-red-dark)] transition-colors"
                            >
                              <span>
                                {pick(currentBanner as unknown as Record<string, unknown>, 'button_text')}
                              </span>
                              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                            </Link>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {activeBanners.length > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--line)] bg-[var(--bg-alt)]">
                  <button
                    type="button"
                    aria-label="Previous banner"
                    onClick={() =>
                      setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length)
                    }
                    className="p-1.5 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand-red)] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {activeBanners.map((b, i) => (
                      <button
                        key={b.id}
                        type="button"
                        aria-label={`Banner ${i + 1}`}
                        onClick={() => setBannerIdx(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === bannerIdx
                            ? 'w-6 bg-[var(--brand-red)]'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="Next banner"
                    onClick={() => setBannerIdx((i) => (i + 1) % activeBanners.length)}
                    className="p-1.5 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand-red)] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
                {t('home.categoriesHeading')}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[var(--ink-soft)]">
                {t('home.categoriesSub')}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] whitespace-nowrap"
            >
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          {catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {(categories ?? []).map((cat) => {
                const catName = pick(cat as unknown as Record<string, unknown>, 'name');
                const showCatImg = Boolean(cat.image_url) && !failedCatImgs[cat.id];
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="group flex flex-col items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-white p-4 transition-colors duration-150 hover:bg-[var(--brand-red)] hover:border-[var(--brand-red)] hover:text-white"
                  >
                    {showCatImg ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-[var(--line)] bg-[var(--bg-alt)] shrink-0">
                        <img
                          src={cat.image_url!}
                          alt={catName}
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedCatImgs((prev) => ({ ...prev, [cat.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-red-light)] text-[var(--brand-red)] group-hover:bg-white/15 group-hover:text-white transition-colors">
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[var(--ink)] group-hover:text-white">
                      {catName}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-[var(--bg-alt)] border-y border-[var(--line)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
                {t('home.featuredHeading')}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[var(--ink-soft)]">
                {t('home.featuredSub')}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] whitespace-nowrap"
            >
              <span>{t('common.browseProducts')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          {featLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {(featured ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why ASATEK & How Ordering Works */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 space-y-14">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--ink)] mb-8">
              {t('home.whyHeading')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-red-light)] text-[var(--brand-red)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[var(--ink)]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--ink)] mb-8">
              {t('home.howHeading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] p-6 space-y-2"
                >
                  <span className="font-heading text-2xl font-bold text-[var(--brand-red)] tabular-nums">
                    {step.num}
                  </span>
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Strip */}
      <section className="bg-[var(--brand-red-light)] border-t border-red-200 py-10 md:py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--brand-red-dark)]">
              {t('home.ctaHeading')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--ink-soft)]">
              {t('home.ctaSub')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/quote">
              <Button variant="primary" size="lg">
                {t('common.orderNow')}
              </Button>
            </Link>
            {whatsappNumber && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-[var(--whatsapp)] text-white font-medium text-base hover:bg-[var(--whatsapp-dark)] transition-colors whitespace-nowrap"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{t('common.whatsappUs')}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
