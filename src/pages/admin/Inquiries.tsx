import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  InquiryChannelBadge,
  InquiryStatusBadge,
} from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { WhatsAppIcon } from '../../components/ui/WhatsAppIcon';
import { useInquiries, useInquiryStatusCounts } from '../../hooks/useInquiries';
import { formatDateTime, formatPKR, getErrorMessage } from '../../lib/format';
import {
  formatBuyerReplyDigits,
  getInquiryTotalAmount,
  getPresetDateRange,
} from '../../lib/orderHelpers';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import type { InquiryChannel, InquiryStatus } from '../../types/db';

type DateFilterPreset = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';

export default function AdminInquiries() {
  const [status, setStatus] = useState<InquiryStatus | 'all'>('new');
  const [channel, setChannel] = useState<InquiryChannel | 'all'>('all');
  const [q, setQ] = useState('');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { dateFrom, dateTo } = useMemo(() => {
    if (datePreset === 'all') return { dateFrom: undefined, dateTo: undefined };
    if (datePreset === 'custom') {
      return {
        dateFrom: customFrom || undefined,
        dateTo: customTo || undefined,
      };
    }
    const r = getPresetDateRange(datePreset);
    return { dateFrom: r.from, dateTo: r.to };
  }, [datePreset, customFrom, customTo]);

  const {
    data: statusCounts,
    refetch: refetchCounts,
  } = useInquiryStatusCounts({ channel, q, dateFrom, dateTo });

  const {
    data: inquiries,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInquiries({ status, channel, q, dateFrom, dateTo });

  const statusTabs: Array<{ key: InquiryStatus | 'all'; label: string }> = [
    { key: 'new', label: 'New' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'completed', label: 'Completed' },
    { key: 'skipped', label: 'Skipped' },
    { key: 'all', label: 'All' },
  ];

  const handleRefresh = () => {
    void refetch();
    void refetchCounts();
  };

  return (
    <AdminLayout title="Orders & Inquiries">
      <div className="space-y-6">
        {/* Status Tabs with Counts */}
        <div
          role="tablist"
          aria-label="Order status tabs"
          className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-3"
        >
          {statusTabs.map((tab) => {
            const active = status === tab.key;
            const count = statusCounts ? statusCounts[tab.key] ?? 0 : null;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(tab.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--brand-red)] text-white'
                    : 'bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)]'
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && (
                  <span
                    className={`inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--bg-alt)] text-[var(--ink)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Channel & Date Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-[var(--ink-soft)] absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search reference, buyer name, or phone..."
                className="w-full min-h-[44px] rounded-lg border border-[var(--line)] bg-white ps-10 pe-3.5 text-sm"
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                aria-label="Filter by channel"
                value={channel}
                onChange={(e) =>
                  setChannel(e.target.value as InquiryChannel | 'all')
                }
              >
                <option value="all">All Channels</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                aria-label="Filter by date"
                value={datePreset}
                onChange={(e) =>
                  setDatePreset(e.target.value as DateFilterPreset)
                }
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  aria-label="From date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="min-h-[44px] rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
                <span className="text-xs text-[var(--ink-soft)]">to</span>
                <input
                  type="date"
                  aria-label="To date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="min-h-[44px] rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {isError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-[var(--brand-red-light)] px-4 py-3 text-sm text-[var(--brand-red-dark)]"
          >
            <span>
              {getErrorMessage(error, 'Could not load orders from Supabase.')}
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

        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Reference</th>
                  <th className="px-4 py-3 text-start">Date / Time</th>
                  <th className="px-4 py-3 text-start">Buyer</th>
                  <th className="px-4 py-3 text-start">City</th>
                  <th className="px-4 py-3 text-start">Channel</th>
                  <th className="px-4 py-3 text-start">Items &amp; Total</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <TableRowSkeleton cols={8} />
                    <TableRowSkeleton cols={8} />
                  </>
                ) : (inquiries ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-[var(--ink-soft)]"
                    >
                      No orders or inquiries found.
                    </td>
                  </tr>
                ) : (
                  (inquiries ?? []).map((inq) => {
                    const replyDigits = formatBuyerReplyDigits(inq.phone);
                    const total = getInquiryTotalAmount(inq);
                    const replyHref = replyDigits
                      ? buildWhatsAppLink(
                          replyDigits,
                          `Assalam o Alaikum ${inq.name}, regarding your ASATEK order ${inq.reference}:`,
                        )
                      : null;

                    return (
                      <tr
                        key={inq.id}
                        className={`border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/50 ${
                          inq.status === 'new' ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono-num font-semibold whitespace-nowrap">
                          <Link
                            to={`/admin/inquiries/${inq.id}`}
                            className="text-[var(--brand-red)] hover:underline"
                          >
                            {inq.reference}
                          </Link>
                          <div className="mt-1">
                            <Badge tone="neutral">
                              {inq.type === 'quote' ? 'Order' : 'Contact'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--ink-soft)] tabular-nums whitespace-nowrap">
                          {formatDateTime(inq.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--ink)]">
                            {!replyDigits && inq.name === 'WhatsApp visitor'
                              ? 'WhatsApp visitor'
                              : inq.name}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                            {replyDigits ? inq.phone : '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[var(--ink-soft)]">
                          {inq.city || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <InquiryChannelBadge channel={inq.channel} />
                        </td>
                        <td className="px-4 py-3 min-w-[210px]">
                          {inq.items.length === 0 ? (
                            <span className="text-xs text-[var(--ink-soft)]">
                              {inq.message ? 'Message inquiry' : '—'}
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {inq.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="text-xs text-[var(--ink)] leading-snug"
                                >
                                  <span className="font-medium">
                                    {item.product_name}
                                  </span>{' '}
                                  <span className="font-mono-num text-[var(--ink-soft)]">
                                    × {item.quantity}
                                  </span>
                                  {item.unit_price !== null && (
                                    <span className="text-[var(--ink-soft)] tabular-nums">
                                      {' '}
                                      @ {formatPKR(item.unit_price)}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {total > 0 && (
                                <p className="text-xs font-bold text-[var(--brand-red)] tabular-nums pt-0.5">
                                  Total: {formatPKR(total)}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <InquiryStatusBadge status={inq.status} />
                          {inq.status === 'skipped' && inq.skip_reason && (
                            <p className="text-[11px] text-[var(--brand-red-dark)] mt-1 max-w-[140px] truncate">
                              {inq.skip_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-end whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {replyHref && (
                              <a
                                href={replyHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${inq.reference} in WhatsApp`}
                                title="Open in WhatsApp"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--whatsapp)] text-white hover:bg-[var(--whatsapp-dark)]"
                              >
                                <WhatsAppIcon className="w-4 h-4" />
                              </a>
                            )}
                            <Link
                              to={`/admin/inquiries/${inq.id}`}
                              className="text-xs font-semibold text-[var(--brand-red)] hover:underline"
                            >
                              Manage
                            </Link>
                          </div>
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
