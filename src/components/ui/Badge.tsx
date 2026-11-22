import React from 'react';
import type { AvailabilityStatus } from '../../types/db';
import { useI18n } from '../../contexts/LanguageContext';

type BadgeTone = 'green' | 'amber' | 'neutral' | 'red';

const toneClasses: Record<BadgeTone, string> = {
  green: 'text-[var(--accent-green)] bg-green-50 border-green-200',
  amber: 'text-[var(--warn)] bg-amber-50 border-amber-200',
  neutral: 'text-[var(--ink-soft)] bg-gray-100 border-gray-200',
  red: 'text-[var(--brand-red)] bg-[var(--brand-red-light)] border-red-200',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const { t } = useI18n();
  const tone: BadgeTone =
    status === 'in_stock'
      ? 'green'
      : status === 'made_to_order'
        ? 'amber'
        : 'neutral';
  return <Badge tone={tone}>{t(`availability.${status}`)}</Badge>;
}
