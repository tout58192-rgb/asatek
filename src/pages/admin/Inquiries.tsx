import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  InquiryChannelBadge,
  InquiryStatusBadge,
} from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useInquiries } from '../../hooks/useInquiries';
import { formatDateTime } from '../../lib/format';
import type { InquiryChannel, InquiryStatus } from '../../types/db';

export default function AdminInquiries() {
  const [status, setStatus] = useState<InquiryStatus | 'all'>('all');
  const [channel, setChannel] = useState<InquiryChannel | 'all'>('all');
  const [q, setQ] = useState('');

  const { data: inquiries, isLoading } = useInquiries({ status, channel, q });

  return (
    <AdminLayout title="Orders & Inquiries">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--ink-soft)] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reference, buyer name, or phone..."
              className="w-full min-h-[44px] rounded-lg border border-[var(--line)] bg-white ps-10 pe-3.5 text-sm"
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as InquiryStatus | 'all')
              }
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </Select>
          </div>

          <div className="w-full sm:w-44">
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
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)] text-xs font-semibold text-[var(--ink-soft)]">
                  <th className="px-4 py-3 text-start">Reference</th>
                  <th className="px-4 py-3 text-start">Date</th>
                  <th className="px-4 py-3 text-start">Buyer</th>
                  <th className="px-4 py-3 text-start">Phone</th>
                  <th className="px-4 py-3 text-start">City</th>
                  <th className="px-4 py-3 text-start">Channel</th>
                  <th className="px-4 py-3 text-start">Type</th>
                  <th className="px-4 py-3 text-start">Status</th>
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
                  (inquiries ?? []).map((inq) => (
                    <tr
                      key={inq.id}
                      className="border-b last:border-b-0 border-[var(--line)] hover:bg-[var(--bg-alt)]/50"
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
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">
                        {inq.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--ink-soft)]">
                        {inq.phone}
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-soft)]">
                        {inq.city || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <InquiryChannelBadge channel={inq.channel} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="neutral">
                          {inq.type === 'quote' ? 'Order' : 'Contact'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <InquiryStatusBadge status={inq.status} />
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
