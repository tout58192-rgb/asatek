import { lazy, Suspense, useMemo, useState } from 'react';
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
import { useAdminSalesSummary, useInquiries } from '../../hooks/useInquiries';
import { formatDateTime, formatPKR, getErrorMessage } from '../../lib/format';
import {
  buildOrdersCsv,
  findBestDay,
  findBestMonth,
  getInquiryTotalAmount,
  getPresetDateRange,
  type DateRangePreset,
} from '../../lib/orderHelpers';

const ManagementCharts = lazy(
  () => import('../../components/admin/ManagementCharts'),
);

export default function AdminManagement() {
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

  const bestDay = summary ? findBestDay(summary.daily) : null;
  const bestMonth = summary ? findBestMonth(summary.monthly) : null;

  const presets: Array<{ id: DateRangePreset; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'last_7_days', label: 'Last 7 days' },
    { id: 'last_30_days', label: 'Last 30 days' },
    { id: 'this_month', label: 'This month' },
    { id: 'last_month', label: 'Last month' },
    { id: 'custom', label: 'Custom range' },
  ];

  const recentOrders = (orders ?? []).slice(0, 20);

  return (
    <AdminLayout title="Management & Reports">
      <div className="space-y-6">
        {/* Date Range Toolbar */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                <span className="text-xs text-[var(--ink-soft)]">to</span>
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
              <span>Export CSV</span>
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
              <span>Refresh</span>
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
              Retry
            </Button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-[var(--brand-red)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-32 rounded skeleton-shimmer" />
            ) : (
              <>
                <p
                  data-testid="kpi-total-revenue"
                  className="text-2xl font-bold text-[var(--brand-red)] tabular-nums"
                >
                  {formatPKR(summary?.totals.revenue ?? 0)}
                </p>
                <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                  Revenue counts confirmed, dispatched and completed orders at wholesale slab prices.
                </p>
              </>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Orders</span>
              <ShoppingBag className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p className="text-2xl font-bold text-[var(--ink)] tabular-nums">
                {summary?.totals.orders ?? 0}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Confirmed Orders</span>
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p className="text-2xl font-bold text-[var(--accent-green)] tabular-nums">
                {summary?.totals.confirmed_orders ?? 0}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>New Orders</span>
              <Inbox className="w-4 h-4 text-[var(--brand-red)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p className="text-2xl font-bold text-[var(--brand-red)] tabular-nums">
                {summary?.totals.new_orders ?? 0}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Skipped Orders</span>
              <Ban className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            ) : (
              <p className="text-2xl font-bold text-[var(--ink)] tabular-nums">
                {summary?.totals.skipped_orders ?? 0}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Average Order Value</span>
              <TrendingUp className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 rounded skeleton-shimmer" />
            ) : (
              <p className="text-2xl font-bold text-[var(--ink)] tabular-nums">
                {formatPKR(summary?.totals.avg_order_value ?? 0)}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Best Day</span>
              <CalendarRange className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 rounded skeleton-shimmer" />
            ) : bestDay ? (
              <div>
                <p className="text-xl font-bold text-[var(--ink)] tabular-nums">
                  {formatPKR(bestDay.revenue)}
                </p>
                <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                  {bestDay.date} · {bestDay.orders} orders
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-[var(--ink-soft)]">—</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
              <span>Best Month</span>
              <CalendarRange className="w-4 h-4 text-[var(--ink-soft)]" />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 rounded skeleton-shimmer" />
            ) : bestMonth ? (
              <div>
                <p className="text-xl font-bold text-[var(--ink)] tabular-nums">
                  {formatPKR(bestMonth.revenue)}
                </p>
                <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                  {bestMonth.month} · {bestMonth.orders} orders
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-[var(--ink-soft)]">—</p>
            )}
          </div>
        </div>

        {/* Charts (Lazy-loaded Recharts chunk) */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-xl skeleton-shimmer" />
            <div className="h-80 rounded-xl skeleton-shimmer" />
          </div>
        ) : summary ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 rounded-xl skeleton-shimmer" />
                <div className="h-80 rounded-xl skeleton-shimmer" />
              </div>
            }
          >
            <ManagementCharts summary={summary} />
          </Suspense>
        ) : null}

        {/* Recent Orders in Range */}
        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                Recent Orders ({orders?.length ?? 0})
              </h2>
              <p className="text-xs text-[var(--ink-soft)]">
                Showing {from} to {to}
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-semibold text-[var(--brand-red)] hover:underline"
            >
              Manage all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Reference</th>
                  <th className="px-4 py-3 text-start">Date</th>
                  <th className="px-4 py-3 text-start">Buyer</th>
                  <th className="px-4 py-3 text-start">City</th>
                  <th className="px-4 py-3 text-start">Channel</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3 text-end">Total</th>
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
                      No orders found in this date range.
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
                        {formatDateTime(inq.created_at)}
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
                        {formatPKR(getInquiryTotalAmount(inq))}
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
