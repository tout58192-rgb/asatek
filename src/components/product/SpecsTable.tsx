import { useI18n } from '../../contexts/LanguageContext';
import type { ProductSpec } from '../../types/db';

export function SpecsTable({ specs }: { specs: ProductSpec[] }) {
  const { t, pick } = useI18n();
  const ordered = [...specs].sort((a, b) => a.sort_order - b.sort_order);

  if (ordered.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--line)] overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--bg-alt)]">
        <h2 className="text-base font-semibold text-[var(--ink)]">
          {t('productDetail.specsTitle')}
        </h2>
      </div>
      <dl className="divide-y divide-[var(--line)]">
        {ordered.map((spec) => (
          <div
            key={spec.id}
            className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3 text-sm"
          >
            <dt className="text-[var(--ink-soft)] font-medium">
              {pick(spec as unknown as Record<string, unknown>, 'label')}
            </dt>
            <dd className="sm:col-span-2 text-[var(--ink)] font-medium tabular-nums">
              {pick(spec as unknown as Record<string, unknown>, 'value')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
