import { useMemo, lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ban,
  CalendarRange,
  CheckCircle2,
  Download,
  Inbox,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  InquiryChannelBadge,
  InquiryStatusBadge,
} from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useI18n } from '../../contexts/LanguageContext';
import { useAdminSalesSummary, useInquiries } from '../../hooks/useInquiries';
import { formatDateTime, formatPKR, getErrorMessage } from '../../lib/format';
import {
  buildOrdersCsv,
  findBestDay,
  formatShortChartDate,
  getInquiryTotalAmount,
  getPresetDateRange,
  type DateRangePreset,
} from '../../lib/orderHelpers';
import { useCountUp } from '../../lib/useCountUp';

const ManagementCharts = lazy(
  () => import('../../components/admin/ManagementCharts'),
);

export default function AdminManagement() {
  const { lang } = useI18n();
  const isUr = lang === 'ur';

  const defaultRange = useMemo(() => getPresetDateRange('last_30_days'), []);
  const [preset, setPreset] = useState<DateRangePreset>('last_30_days');
  const [customFrom, setCustomFrom] = useState(defaultRange.from);
  const [customTo, setCustomTo] = useState(defaultRange.to);

  const { from, to } = useMemo(() => {
    if (preset === 'custom') {
      return { from: customFrom, to: customTo };
    }
    return getPresetDateRange(preset);
  }, [preset, customFrom, customTo]);

  const {
    data: summary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    isError: summaryError,
    error: summaryErrObj,
    refetch: refetchSummary,
  } = useAdminSalesSummary(from, to);

  const {
    data: orders,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    isError: ordersError,
    error: ordersErrObj,
    refetch: refetchOrders,
  } = useInquiries({ dateFrom: from, dateTo: to });

  const refreshing = summaryFetching || ordersFetching;

  const handleRefresh = () => {
    void refetchSummary();
    void refetchOrders();
  };

  const handleExportCsv = () => {
    const csv = buildOrdersCsv(orders ?? []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asatek-orders-${from}-to-${to}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const bestDay = useMemo(
    () => (summary ? findBestDay(summary.daily) : null),
    [summary],
  );

  const cancelledCount =
    summary?.totals.cancelled_orders ??
    summary?.by_status.find((s) => s.status === 'cancelled')?.orders ??
    0;
  const skippedAndCancelled =
    (summary?.totals.skipped_orders ?? 0) + cancelledCount;

  const animatedRevenue = useCountUp(summary?.totals.revenue ?? 0);
  const animatedOrders = useCountUp(summary?.totals.orders ?? 0);
  const animatedConfirmed = useCountUp(summary?.totals.confirmed_orders ?? 0);
  const animatedNew = useCountUp(summary?.totals.new_orders ?? 0);
  const animatedSkippedCancelled = useCountUp(skippedAndCancelled);
  const animatedAov = useCountUp(summary?.totals.avg_order_value ?? 0);
  const animatedBestDayRevenue = useCountUp(bestDay?.revenue ?? 0);

  const presets: Array<{ id: DateRangePreset; label: string }> = [
    { id: 'today', label: isUr ? 'آج' : 'Today' },
    { id: 'last_7_days', label: isUr ? 'پچھلے 7 دن' : 'Last 7 days' },
    { id: 'last_30_days', label: isUr ? 'پچھلے 30 دن' : 'Last 30 days' },
    { id: 'this_month', label: isUr ? 'یہ مہینہ' : 'This month' },
    { id: 'last_month', label: isUr ? 'پچھلا مہینہ' : 'Last month' },
    { id: 'custom', label: isUr ? 'مخصوص تاریخ' : 'Custom range' },
  ];

  const recentOrders = (orders ?? []).slice(0, 20);

  return (
    <AdminLayout title={isUr ? 'مینجمنٹ اور رپورٹس' : 'Management & Reports'}>
      <div className="space-y-6">
        {/* Date Range Toolbar */}
        <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  preset === p.id
                    ? 'bg-[var(--brand-red)] text-white'
                    : 'bg-[var(--bg-alt)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                {p.label}
              </button>
            ))}

            {preset === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 ms-1">
                <input
                  type="date"
                  aria-label="Report start date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[var(--line)] bg-white px-2.5 text-xs sm:text-sm"
                />
                <span className="text-xs text-[var(--ink-soft)]">
                  {isUr ? 'تا' : 'to'}
                </span>
                <input
                  type="date"
                  aria-label="Report end date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[var(--line)] bg-white px-2.5 text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={!orders || orders.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>{isUr ? 'CSV برآمد کریں' : 'Export CSV'}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span>{isUr ? 'تازہ کریں' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {(summaryError || ordersError) && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-[var(--brand-red-light)] px-4 py-3 text-sm text-[var(--brand-red-dark)]"
          >
            <span>
              {getErrorMessage(
                summaryErrObj || ordersErrObj,
                'Could not load sales summary from Supabase.',
              )}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              {isUr ? 'دوبارہ کوشش کریں' : 'Retry'}
            </Button>
          </div>
        )}

        {/* 7 KPI Cards */}
        <div
          data-testid="management-kpi-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>{isUr ? 'کل آمدنی' : 'Total revenue'}</span>
              <TrendingUp className="w-4 h-4 text-[var(--brand-red)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-36 rounded skeleton-shimmer" />
            ) : (
              <>
                <p
                  data-testid="kpi-total-revenue"
                  dir="ltr"
                  className="text-2xl font-bold text-[var(--brand-red)] tabular-nums text-start"
                >
                  {formatPKR(animatedRevenue)}
                </p>
                <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                  {isUr
                    ? 'آمدنی میں کنفرم، ڈسپیچ اور مکمل آرڈرز شامل ہیں؛ اسکپ اور منسوخ شامل نہیں۔'
                    : 'Counts confirmed, dispatched and completed orders; excludes skipped and cancelled.'}
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>{isUr ? 'آرڈرز' : 'Orders'}</span>
              <ShoppingBag className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p
                data-testid="kpi-orders"
                dir="ltr"
                className="text-2xl font-bold text-[var(--ink)] tabular-nums text-start"
              >
                {animatedOrders}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>{isUr ? 'کنفرم' : 'Confirmed'}</span>
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p
                data-testid="kpi-confirmed"
                dir="ltr"
                className="text-2xl font-bold text-[var(--accent-green)] tabular-nums text-start"
              >
                {animatedConfirmed}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>{isUr ? 'نئے آرڈرز' : 'New'}</span>
              <Inbox className="w-4 h-4 text-[var(--brand-red)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p
                data-testid="kpi-new"
                dir="ltr"
                className="text-2xl font-bold text-[var(--brand-red)] tabular-nums text-start"
              >
                {animatedNew}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>
                {isUr ? 'اسکپ + منسوخ' : 'Skipped + Cancelled'}
              </span>
              <Ban className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p
                data-testid="kpi-skipped-cancelled"
                dir="ltr"
                className="text-2xl font-bold text-[var(--ink)] tabular-nums text-start"
              >
                {animatedSkippedCancelled}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>
                {isUr ? 'اوسط آرڈر ویلیو' : 'Average order value'}
              </span>
              <TrendingUp className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 rounded skeleton-shimmer" />
            ) : (
              <p
                data-testid="kpi-aov"
                dir="ltr"
                className="text-2xl font-bold text-[var(--ink)] tabular-nums text-start"
              >
                {formatPKR(animatedAov)}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>{isUr ? 'بہترین دن' : 'Best day'}</span>
              <CalendarRange className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 rounded skeleton-shimmer" />
            ) : bestDay ? (
              <div>
                <p
                  data-testid="kpi-best-day"
                  dir="ltr"
                  className="text-xl font-bold text-[var(--ink)] tabular-nums text-start"
                >
                  {formatPKR(animatedBestDayRevenue)}
                </p>
                <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                  <span dir="ltr">{formatShortChartDate(bestDay.date)}</span> ·{' '}
                  <span dir="ltr">{bestDay.orders}</span>{' '}
                  {isUr ? 'آرڈرز' : 'orders'}
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-[var(--ink-soft)]">—</p>
            )}
          </div>
        </div>

        {/* Single Chart: Sales by date (Lazy-loaded Recharts chunk) */}
        {summaryLoading ? (
          <div className="h-[390px] rounded-2xl skeleton-shimmer" />
        ) : summary ? (
          <Suspense
            fallback={<div className="h-[390px] rounded-2xl skeleton-shimmer" />}
          >
            <ManagementCharts summary={summary} />
          </Suspense>
        ) : null}

        {/* Recent Orders in Range */}
        <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                {isUr
                  ? `حالیہ آرڈرز (${orders?.length ?? 0})`
                  : `Recent Orders (${orders?.length ?? 0})`}
              </h2>
              <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                <span dir="ltr">
                  {from} — {to}
                </span>
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-semibold text-[var(--brand-red)] hover:underline"
            >
              {isUr ? 'تمام آرڈرز دیکھیں ←' : 'Manage all orders →'}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'ریفرنس' : 'Reference'}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'تاریخ' : 'Date'}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'خریدار' : 'Buyer'}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'شہر' : 'City'}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'ذریعہ' : 'Channel'}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isUr ? 'اسٹیٹس' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-end">
                    {isUr ? 'کل رقم' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <>
                    <TableRowSkeleton cols={7} />
                    <TableRowSkeleton cols={7} />
                  </>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]"
                    >
                      {isUr
                        ? 'اس مدت میں کوئی آرڈر نہیں ملا۔'
                        : 'No orders found in this date range.'}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((inq) => (
                    <tr
                      key={inq.id}
                      className="border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/50"
                    >
                      <td className="px-4 py-3 font-mono-num font-semibold whitespace-nowrap">
                        <Link
                          to={`/admin/inquiries/${inq.id}`}
                          className="text-[var(--brand-red)] hover:underline"
                        >
                          {inq.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--ink-soft)] tabular-nums whitespace-nowrap">
                        <span dir="ltr">{formatDateTime(inq.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--ink)]">
                          {inq.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--ink-soft)]">
                        {inq.city || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <InquiryChannelBadge channel={inq.channel} />
                      </td>
                      <td className="px-4 py-3">
                        <InquiryStatusBadge status={inq.status} />
                      </td>
                      <td className="px-4 py-3 text-end font-semibold tabular-nums">
                        <span dir="ltr">
                          {formatPKR(getInquiryTotalAmount(inq))}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
