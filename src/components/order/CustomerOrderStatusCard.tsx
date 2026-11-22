import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';
import type { InquiryStatus } from '../../types/db';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

interface CustomerOrderStatusCardProps {
  status: InquiryStatus;
  skipReason?: string | null;
  factorySupportHref?: string | null;
}

export function CustomerOrderStatusCard({
  status,
  skipReason,
  factorySupportHref,
}: CustomerOrderStatusCardProps) {
  const { t } = useI18n();

  if (status === 'confirmed') {
    return (
      <div
        data-testid="track-confirmed-card"
        className="rounded-xl border border-green-300 bg-green-50 p-5 space-y-3 text-start"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[var(--accent-green)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-green-900">
              {t('track.confirmedTitle')}
            </h2>
            <p className="text-sm text-green-800">{t('track.confirmedDesc')}</p>
          </div>
        </div>
        {factorySupportHref && (
          <div className="pt-1">
            <a
              href={factorySupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-semibold leading-relaxed hover:bg-[var(--whatsapp-dark)]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t('track.contactFactory')}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  if (status === 'skipped') {
    return (
      <div
        data-testid="track-skipped-card"
        className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-3 text-start"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-[var(--warn)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-amber-900">
              {t('track.skippedTitle')}
            </h2>
            <p className="text-sm text-amber-800">{t('track.skippedDesc')}</p>
            {skipReason && (
              <p className="text-sm font-semibold text-[var(--ink)] pt-1">
                {t('track.skipReasonLabel')}: {skipReason}
              </p>
            )}
          </div>
        </div>
        {factorySupportHref && (
          <div className="pt-1">
            <a
              href={factorySupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-semibold leading-relaxed hover:bg-[var(--whatsapp-dark)]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t('track.contactFactory')}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div
        data-testid="track-cancelled-card"
        className="rounded-xl border border-red-300 bg-[var(--brand-red-light)] p-5 space-y-3 text-start"
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-[var(--brand-red)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--brand-red-dark)]">
              {t('track.cancelledTitle')}
            </h2>
            <p className="text-sm text-[var(--brand-red-dark)]">
              {t('track.cancelledDesc')}
            </p>
            {skipReason && (
              <p className="text-sm font-semibold text-[var(--ink)] pt-1">
                {t('track.skipReasonLabel')}: {skipReason}
              </p>
            )}
          </div>
        </div>
        {factorySupportHref && (
          <div className="pt-1">
            <a
              href={factorySupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-semibold leading-relaxed hover:bg-[var(--whatsapp-dark)]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t('track.contactFactory')}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return null;
}
