import { useEffect, useState } from 'react';
import { useIntro } from '../../contexts/IntroContext';
import { useI18n } from '../../contexts/LanguageContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';

export function OpeningIntro() {
  const { showIntro, exiting, skipIntro } = useIntro();
  const { lang } = useI18n();
  const { data: settings } = useSettings();
  const [logoFailed, setLogoFailed] = useState(false);

  const logoUrl = pickSetting(settings, 'logo_url', 'en', '');

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    if (!showIntro) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showIntro, skipIntro]);

  if (!showIntro) return null;

  return (
    <div
      data-testid="opening-intro"
      role="presentation"
      onClick={skipIntro}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#14141A] text-white cursor-pointer select-none overflow-hidden transition-[transform,opacity] duration-[400ms] ease-out will-change-[transform,opacity] ${
        exiting
          ? 'opacity-0 -translate-y-4 pointer-events-none'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Soft brand crimson radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(200, 16, 46, 0.28) 0%, rgba(139, 10, 30, 0.1) 38%, rgba(20, 20, 26, 0) 70%)',
        }}
      />

      {/* Skip tap target */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          skipIntro();
        }}
        aria-label={lang === 'ur' ? 'انٹرو چھوڑیں' : 'Skip intro'}
        className="absolute top-5 end-5 z-10 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl border border-white/20 bg-white/[0.08] text-xs font-semibold text-white/90 hover:bg-white/[0.16] hover:text-white active:scale-[0.98] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
      >
        Skip
      </button>

      {/* Center Brand Reveal + Drawing Red Line */}
      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="asatek-intro-logo flex items-center justify-center">
          {logoUrl && !logoFailed ? (
            <img
              src={logoUrl}
              alt="ASATEK"
              width={160}
              height={72}
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
            />
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-[var(--accent-green)] bg-white text-[var(--brand-red)] font-heading font-bold text-xl sm:text-2xl shadow-lg">
                A
              </span>
              <span className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
                ASATEK
              </span>
            </div>
          )}
        </div>

        {/* Thin red line drawing underneath */}
        <div
          aria-hidden="true"
          className="asatek-intro-line mt-4 h-[2.5px] w-36 sm:w-48 rounded-full bg-gradient-to-r from-[#8B0A1E] via-[#C8102E] to-[#FF5C77] origin-center"
        />
      </div>
    </div>
  );
}
