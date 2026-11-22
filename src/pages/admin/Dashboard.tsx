import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Inbox,
  Package,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  InquiryChannelBadge,
  InquiryStatusBadge,
} from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useDashboardCounts, useInquiries } from '../../hooks/useInquiries';
import { formatDateTime, getErrorMessage } from '../../lib/format';

function isAnonymousPhone(phone: string | null | undefined): boolean {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length < 10 || /^0+$/.test(digits);
}

export default function AdminDashboard() {
  const {
    data: counts,
    isLoading: countsLoading,
    isFetching: countsFetching,
    isError: countsError,
    error: countsErrObj,
    refetch: refetchCounts,
  } = useDashboardCounts();
  const {
    data: inquiries,
    isLoading: inqLoading,
    isFetching: inqFetching,
    isError: inqError,
    error: inqErrObj,
    refetch: refetchInq,
  } = useInquiries();

  const latestFive = (inquiries ?? []).slice(0, 5);
  const refreshing = countsFetching || inqFetching;

  const handleRefresh = () => {
    void refetchCounts();
    void refetchInq();
  };

  const cards = [
    {
      label: 'New Orders',
      sub:
        counts && counts.new_inquiries > counts.new_orders
          ? `${counts.new_inquiries} total new incl. contact`
          : undefined,
      value: counts?.new_orders ?? 0,
      icon: Inbox,
      accent: 'text-[var(--brand-red)]',
    },
    {
      label: 'Total Products',
      value: counts?.total_products ?? 0,
      icon: Package,
      accent: 'text-[var(--ink)]',
    },
    {
      label: 'Active Products',
      value: counts?.active_products ?? 0,
      icon: PackageCheck,
      accent: 'text-[var(--accent-green)]',
    },
    {
      label: 'Orders & Inquiries (7 Days)',
      value: counts?.inquiries_last_7_days ?? 0,
      icon: CalendarDays,
      accent: 'text-[var(--ink)]',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--ink-soft)]">
            Auto-refreshes every 30 seconds
          </p>
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

        {(countsError || inqError) && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-[var(--brand-red-light)] px-4 py-3 text-sm text-[var(--brand-red-dark)]"
          >
            <span>
              {getErrorMessage(
                countsErrObj || inqErrObj,
                'Could not load live dashboard data from Supabase.',
              )}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)]">
                  <span>{card.label}</span>
                  <Icon className="w-4 h-4 text-[var(--ink-soft)]" />
                </div>
                {countsLoading ? (
                  <div className="h-8 w-16 rounded skeleton-shimmer" />
                ) : (
                  <div>
                    <p className={`text-3xl font-bold tabular-nums ${card.accent}`}>
                      {card.value}
                    </p>
                    {card.sub && (
                      <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                        {card.sub}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Latest 5 Inquiries */}
        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Latest Orders &amp; Inquiries
            </h2>
            <Link
              to="/admin/inquiries"
              className="text-xs font-semibold text-[var(--brand-red)] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Reference</th>
                  <th className="px-4 py-3 text-start">Date</th>
                  <th className="px-4 py-3 text-start">Buyer</th>
                  <th className="px-4 py-3 text-start">Channel</th>
                  <th className="px-4 py-3 text-start">Status</th>
                </tr>
              </thead>
              <tbody>
                {inqLoading ? (
                  <>
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                  </>
                ) : latestFive.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-[var(--ink-soft)]"
                    >
                      No orders or inquiries yet.
                    </td>
                  </tr>
                ) : (
                  latestFive.map((inq) => {
                    const anonPhone = isAnonymousPhone(inq.phone);
                    return (
                      <tr
                        key={inq.id}
                        className={`border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/60 ${
                          inq.status === 'new' ? 'bg-red-50/45' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono-num font-semibold">
                          <Link
                            to={`/admin/inquiries/${inq.id}`}
                            className="text-[var(--brand-red)] hover:underline"
                          >
                            {inq.reference}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--ink-soft)] tabular-nums">
                          {formatDateTime(inq.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--ink)]">
                            {anonPhone && inq.name === 'WhatsApp visitor'
                              ? 'WhatsApp visitor'
                              : inq.name}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                            {anonPhone ? '—' : inq.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <InquiryChannelBadge channel={inq.channel} />
                        </td>
                        <td className="px-4 py-3">
                          <InquiryStatusBadge status={inq.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
