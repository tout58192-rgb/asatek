import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useI18n } from '../contexts/LanguageContext';
import { useTrackedOrder } from '../hooks/useInquiries';
import { useSettings } from '../hooks/useSettings';
import { formatDate, formatDateTime, formatPKR, getErrorMessage } from '../lib/format';
import { pickSetting } from '../lib/i18n';
import { getOrderTimelineStep } from '../lib/orderHelpers';
import { loadRecentOrders, type RecentOrderEntry } from '../lib/recentOrders';
import { buildWhatsAppLink } from '../lib/whatsapp';

export default function Track() {
  const { lang, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: settings } = useSettings();

  const initialRef = searchParams.get('ref') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [submittedRef, setSubmittedRef] = useState(initialRef);
  const [submittedPhone, setSubmittedPhone] = useState(initialPhone);
  const [recentOrders, setRecentOrders] = useState<RecentOrderEntry[]>([]);

  useEffect(() => {
    setRecentOrders(loadRecentOrders());
  }, []);

  useEffect(() => {
    const urlRef = searchParams.get('ref') || '';
    const urlPhone = searchParams.get('phone') || '';
    if (urlRef && urlPhone) {
      setRefInput(urlRef);
      setPhoneInput(urlPhone);
      setSubmittedRef(urlRef);
      setSubmittedPhone(urlPhone);
    }
  }, [searchParams]);

  const hasQuery = Boolean(submittedRef.trim()) && Boolean(submittedPhone.trim());

  const {
    data: order,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTrackedOrder(submittedRef, submittedPhone, hasQuery);

  const handleTrack = (refVal: string, phoneVal: string) => {
    const cleanRef = refVal.trim();
    const cleanPhone = phoneVal.trim();
    if (!cleanRef || !cleanPhone) return;
    setRefInput(cleanRef);
    setPhoneInput(cleanPhone);
    setSubmittedRef(cleanRef);
    setSubmittedPhone(cleanPhone);
    setSearchParams({ ref: cleanRef, phone: cleanPhone });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(refInput, phoneInput);
  };

  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');
  const factorySupportHref =
    whatsappNumber && order
      ? buildWhatsAppLink(
          whatsappNumber,
          `Assalam o Alaikum ASATEK, I need help regarding order ${order.reference}.`,
        )
      : whatsappNumber
        ? buildWhatsAppLink(whatsappNumber, 'Assalam o Alaikum ASATEK, order status inquiry.')
        : null;

  const steps = [
    { key: 'received', label: t('track.steps.received'), icon: Clock },
    { key: 'confirmed', label: t('track.steps.confirmed'), icon: CheckCircle2 },
    { key: 'dispatched', label: t('track.steps.dispatched'), icon: Truck },
    { key: 'completed', label: t('track.steps.completed'), icon: PackageCheck },
  ];

  const activeStep = order ? getOrderTimelineStep(order.status) : 0;

  return (
    <Layout title={t('track.title')} description={t('track.subtitle')}>
      <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-8">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            {t('track.title')}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--ink-soft)]">
            {t('track.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lookup Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-xl border border-[var(--line)] bg-white p-6 space-y-4"
          >
            <Input
              label={t('track.referenceLabel')}
              placeholder={t('track.referencePlaceholder')}
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              required
            />

            <Input
              label={t('track.phoneLabel')}
              placeholder={t('track.phonePlaceholder')}
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              <Search className="w-4 h-4" />
              <span>{t('track.submitButton')}</span>
            </Button>
          </form>

          {/* My Recent Orders (from localStorage) */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--line)] bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[var(--ink)]">
              {t('track.recentHeading')}
            </h2>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                {t('track.recentEmpty')}
              </p>
            ) : (
              <div className="divide-y divide-[var(--line)] max-h-64 overflow-y-auto">
                {recentOrders.map((entry) => {
                  const isActive =
                    submittedRef.toLowerCase() === entry.reference.toLowerCase();
                  return (
                    <button
                      key={entry.reference}
                      type="button"
                      onClick={() => handleTrack(entry.reference, entry.phone)}
                      className={`w-full text-start py-2.5 px-2 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[var(--brand-red-light)]'
                          : 'hover:bg-[var(--bg-alt)]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-mono-num text-sm font-semibold text-[var(--brand-red)] truncate">
                          {entry.reference}
                        </p>
                        <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                          <span dir="ltr">{entry.phone}</span> ·{' '}
                          <span dir="ltr">{formatDate(entry.created_at, lang)}</span>
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[var(--ink)] shrink-0">
                        {t('track.useOrder')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Result Area */}
        {hasQuery && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
                <div className="h-6 w-48 rounded skeleton-shimmer" />
                <div className="h-20 w-full rounded-lg skeleton-shimmer" />
                <div className="h-32 w-full rounded-lg skeleton-shimmer" />
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-[var(--brand-red-light)] p-6 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--brand-red-dark)]">
                    {t('track.errorTitle')}
                  </p>
                  <p className="text-sm text-[var(--brand-red-dark)]">
                    {getErrorMessage(error, t('track.errorTitle'))}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => void refetch()}>
                  {t('common.retry')}
                </Button>
              </div>
            ) : !order ? (
              <div
                data-testid="track-not-found"
                className="rounded-xl border border-[var(--line)] bg-white p-8 text-center space-y-2"
              >
                <AlertTriangle className="w-8 h-8 text-[var(--warn)] mx-auto" />
                <p className="text-base font-semibold text-[var(--ink)]">
                  {t('track.notFound')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Header */}
                <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                    <div>
                      <p className="font-mono-num text-xl font-bold text-[var(--brand-red)]">
                        {order.reference}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)] tabular-nums mt-1">
                        {t('track.placedOn')}: {formatDateTime(order.created_at)}
                        {order.status_updated_at && (
                          <>
                            {' '}
                            · {t('track.lastUpdated')}:{' '}
                            {formatDateTime(order.status_updated_at)}
                          </>
                        )}
                      </p>
                    </div>
                    <Badge
                      tone={
                        order.status === 'skipped'
                          ? 'red'
                          : order.status === 'completed'
                            ? 'green'
                            : order.status === 'confirmed' ||
                                order.status === 'dispatched'
                              ? 'amber'
                              : 'neutral'
                      }
                    >
                      {t(`track.statuses.${order.status}`)}
                    </Badge>
                  </div>

                  {/* Skipped Card vs Timeline */}
                  {order.status === 'skipped' ? (
                    <div
                      data-testid="track-skipped-card"
                      className="rounded-xl border border-red-300 bg-[var(--brand-red-light)] p-5 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-[var(--brand-red)] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h2 className="text-base font-bold text-[var(--brand-red-dark)]">
                            {t('track.skippedTitle')}
                          </h2>
                          <p className="text-sm text-[var(--brand-red-dark)]">
                            {t('track.skippedDesc')}
                          </p>
                          {order.skip_reason && (
                            <p className="text-sm font-semibold text-[var(--ink)] pt-1">
                              {t('track.skipReasonLabel')}: {order.skip_reason}
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
                            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-semibold hover:bg-[var(--whatsapp-dark)]"
                          >
                            <WhatsAppIcon className="w-4 h-4" />
                            <span>{t('track.contactFactory')}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      data-testid="track-timeline"
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
                    >
                      {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const reached = activeStep >= idx;
                        const isCurrent = activeStep === idx;
                        return (
                          <div
                            key={step.key}
                            className={`rounded-xl border p-3.5 flex items-center gap-3 transition-colors ${
                              isCurrent
                                ? 'border-[var(--brand-red)] bg-[var(--brand-red-light)]'
                                : reached
                                  ? 'border-green-200 bg-green-50/70'
                                  : 'border-[var(--line)] bg-[var(--bg-alt)] opacity-60'
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                isCurrent
                                  ? 'bg-[var(--brand-red)] text-white'
                                  : reached
                                    ? 'bg-[var(--accent-green)] text-white'
                                    : 'bg-white border border-[var(--line)] text-[var(--ink-soft)]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-sm font-semibold ${
                                isCurrent
                                  ? 'text-[var(--brand-red-dark)]'
                                  : reached
                                    ? 'text-[var(--ink)]'
                                    : 'text-[var(--ink-soft)]'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-[var(--ink-soft)]">
                    {t('track.autoRefreshNote')}
                    {isFetching ? ` (${t('common.loading')})` : ''}
                  </p>
                </div>

                {/* Items & Total */}
                <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[var(--line)] bg-[var(--bg-alt)]">
                    <h2 className="text-sm font-bold text-[var(--ink)]">
                      {t('track.itemsHeading')} ({order.items.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start">
                      <thead>
                        <tr className="border-b border-[var(--line)] text-xs text-[var(--ink-soft)]">
                          <th className="px-4 py-2.5 text-start">
                            {t('track.productCol')}
                          </th>
                          <th className="px-4 py-2.5 text-start">
                            {t('track.skuCol')}
                          </th>
                          <th className="px-4 py-2.5 text-end">
                            {t('track.qtyCol')}
                          </th>
                          <th className="px-4 py-2.5 text-end">
                            {t('track.priceCol')}
                          </th>
                          <th className="px-4 py-2.5 text-end">
                            {t('track.lineTotalCol')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => {
                          const lineTotal =
                            Number(item.unit_price ?? 0) * item.quantity;
                          return (
                            <tr
                              key={`${item.product_name}-${i}`}
                              className="border-b last:border-b-0 border-[var(--line)]"
                            >
                              <td className="px-4 py-3 font-medium">
                                {item.product_name}
                              </td>
                              <td className="px-4 py-3 font-mono-num text-xs text-[var(--ink-soft)]">
                                {item.sku || '—'}
                              </td>
                              <td className="px-4 py-3 text-end tabular-nums font-semibold">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-end tabular-nums">
                                {item.unit_price !== null
                                  ? formatPKR(item.unit_price)
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 text-end tabular-nums font-semibold">
                                {formatPKR(lineTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--bg-alt)] font-bold">
                          <td colSpan={4} className="px-4 py-3 text-end">
                            {t('track.totalLabel')}
                          </td>
                          <td className="px-4 py-3 text-end tabular-nums text-[var(--brand-red)]">
                            {formatPKR(
                              order.total_amount ??
                                order.items.reduce(
                                  (sum, it) =>
                                    sum + Number(it.unit_price ?? 0) * it.quantity,
                                  0,
                                ),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
