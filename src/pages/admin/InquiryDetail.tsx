import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Trash2,
  Truck,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  InquiryChannelBadge,
  InquiryStatusBadge,
} from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { WhatsAppIcon } from '../../components/ui/WhatsAppIcon';
import { useToast } from '../../contexts/ToastContext';
import { useInquiry } from '../../hooks/useInquiries';
import { formatDateTime, formatPKR, getErrorMessage } from '../../lib/format';
import type { Lang } from '../../lib/i18n';
import {
  buildBuyerStatusWhatsAppMessage,
  formatBuyerReplyDigits,
  getInquiryTotalAmount,
} from '../../lib/orderHelpers';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import {
  deleteInquiry,
  updateInquiry,
  type UpdateInquiryPayload,
} from '../../services/inquiries';
import type { InquiryStatus } from '../../types/db';

export default function AdminInquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: inquiry, isLoading, isError, error, refetch } = useInquiry(id);
  const [status, setStatus] = useState<InquiryStatus>('new');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [skipReasonInput, setSkipReasonInput] = useState('');
  const [waLang, setWaLang] = useState<Lang>('en');

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status);
      setAdminNote(inquiry.admin_note ?? '');
      setSkipReasonInput(inquiry.skip_reason ?? '');
    }
  }, [inquiry]);

  const invalidateAll = async (inquiryId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inquiries'] }),
      queryClient.invalidateQueries({ queryKey: ['inquiry_status_counts'] }),
      queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] }),
      queryClient.invalidateQueries({ queryKey: ['sales_summary'] }),
    ]);
  };

  const applyUpdate = async (
    payload: UpdateInquiryPayload,
    successToast: string,
  ) => {
    if (!inquiry) return;
    setSaving(true);
    try {
      await updateInquiry(inquiry.id, payload);
      await invalidateAll(inquiry.id);
      showToast(successToast);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update order'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNoteAndStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry) return;
    const now = new Date().toISOString();
    const payload: UpdateInquiryPayload = {
      status,
      admin_note: adminNote.trim() || null,
      ...(status !== inquiry.status ? { status_updated_at: now } : {}),
      ...(status === 'confirmed' && !inquiry.confirmed_at
        ? { confirmed_at: now }
        : {}),
      ...(status !== 'skipped' ? { skip_reason: null } : {}),
    };
    await applyUpdate(payload, 'Order changes saved');
  };

  const handleStatusAction = async (
    nextStatus: InquiryStatus,
    reason?: string | null,
  ) => {
    if (!inquiry) return;
    const now = new Date().toISOString();
    const payload: UpdateInquiryPayload = {
      status: nextStatus,
      status_updated_at: now,
      admin_note: adminNote.trim() || null,
      ...(nextStatus === 'confirmed'
        ? { confirmed_at: inquiry.confirmed_at ?? now, skip_reason: null }
        : {}),
      ...(nextStatus === 'skipped'
        ? { skip_reason: reason?.trim() || null }
        : {}),
      ...(nextStatus === 'new' ? { skip_reason: null } : {}),
    };
    const labelMap: Record<InquiryStatus, string> = {
      new: 'Order reopened',
      contacted: 'Marked as contacted',
      confirmed: 'Order confirmed',
      dispatched: 'Order marked dispatched',
      completed: 'Order marked completed',
      skipped: 'Order skipped',
      closed: 'Order closed',
    };
    await applyUpdate(payload, labelMap[nextStatus]);
  };

  const handleConfirmSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkipOpen(false);
    await handleStatusAction('skipped', skipReasonInput);
  };

  const handleDelete = async () => {
    if (!inquiry) return;
    setSaving(true);
    try {
      await deleteInquiry(inquiry.id);
      await invalidateAll(inquiry.id);
      showToast('Order deleted');
      navigate('/admin/inquiries');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete order'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading Order...">
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Error Loading Order">
        <div className="rounded-xl border border-red-200 bg-[var(--brand-red-light)] p-6 text-center space-y-4">
          <p className="text-sm text-[var(--brand-red-dark)]">
            {getErrorMessage(error, 'Could not load order details.')}
          </p>
          <Button type="button" variant="primary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (!inquiry) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            This order could not be found.
          </p>
          <Link to="/admin/inquiries">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const orderTotal = getInquiryTotalAmount(inquiry);
  const replyDigits = formatBuyerReplyDigits(inquiry.phone);
  const statusUpdateMsg = buildBuyerStatusWhatsAppMessage({
    reference: inquiry.reference,
    status: inquiry.status,
    skipReason: inquiry.skip_reason,
    lang: waLang,
  });
  const replyWhatsappHref = replyDigits
    ? buildWhatsAppLink(replyDigits, statusUpdateMsg)
    : null;

  return (
    <AdminLayout title={`Order ${inquiry.reference}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/inquiries"
            className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--brand-red)]"
          >
            ← Back to Orders &amp; Inquiries
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {replyWhatsappHref && (
              <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWaLang((l) => (l === 'en' ? 'ur' : 'en'))}
                  aria-label="Toggle WhatsApp message language"
                  className="px-2.5 min-h-[40px] text-xs font-semibold text-[var(--ink)] bg-[var(--bg-alt)] border-e border-[var(--line)] hover:bg-gray-200 cursor-pointer"
                >
                  {waLang === 'en' ? 'EN' : 'UR'}
                </button>
                <a
                  href={replyWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-[var(--whatsapp)] text-white text-sm font-medium hover:bg-[var(--whatsapp-dark)]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send update on WhatsApp</span>
                </a>
              </div>
            )}

            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={saving}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Quick Order Workflow Actions */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saving || inquiry.status === 'confirmed'}
              onClick={() => void handleStatusAction('confirmed')}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving || inquiry.status === 'dispatched'}
              onClick={() => void handleStatusAction('dispatched')}
            >
              <Truck className="w-4 h-4" />
              <span>Mark dispatched</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving || inquiry.status === 'completed'}
              onClick={() => void handleStatusAction('completed')}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Mark completed</span>
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={saving || inquiry.status === 'skipped'}
              onClick={() => setSkipOpen(true)}
            >
              <Ban className="w-4 h-4" />
              <span>Skip</span>
            </Button>

            {inquiry.status !== 'new' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => void handleStatusAction('new')}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reopen</span>
              </Button>
            )}
          </div>

          {saving && (
            <span className="text-xs font-medium text-[var(--ink-soft)]">
              Updating order...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Buyer & Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="font-mono-num text-lg font-bold text-[var(--brand-red)]">
                    {inquiry.reference}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                    Placed: {formatDateTime(inquiry.created_at)}
                    {inquiry.status_updated_at && (
                      <> · Updated: {formatDateTime(inquiry.status_updated_at)}</>
                    )}
                    {inquiry.confirmed_at && (
                      <> · Confirmed: {formatDateTime(inquiry.confirmed_at)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <InquiryChannelBadge channel={inquiry.channel} />
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
              </div>

              {inquiry.status === 'skipped' && inquiry.skip_reason && (
                <div className="rounded-lg border border-red-200 bg-[var(--brand-red-light)] px-4 py-3 text-sm text-[var(--brand-red-dark)]">
                  <strong>Skip Reason:</strong> {inquiry.skip_reason}
                </div>
              )}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">Buyer Name</dt>
                  <dd className="font-semibold text-[var(--ink)]">{inquiry.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">Phone / WhatsApp</dt>
                  <dd className="font-semibold tabular-nums text-[var(--ink)]">
                    {replyDigits ? inquiry.phone : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">City</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {inquiry.city || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">Business Name</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {inquiry.business_name || '—'}
                  </dd>
                </div>
              </dl>

              {inquiry.message && (
                <div className="pt-3 border-t border-[var(--line)]">
                  <p className="text-xs text-[var(--ink-soft)] mb-1">
                    Buyer Notes / Message
                  </p>
                  <p className="text-sm text-[var(--ink)] whitespace-pre-line">
                    {inquiry.message}
                  </p>
                </div>
              )}
            </div>

            {inquiry.items.length > 0 && (
              <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[var(--line)] bg-[var(--bg-alt)]">
                  <h2 className="text-sm font-bold text-[var(--ink)]">
                    Requested Items ({inquiry.items.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-start">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-xs text-[var(--ink-soft)]">
                        <th className="px-4 py-2.5 text-start">Product</th>
                        <th className="px-4 py-2.5 text-start">SKU</th>
                        <th className="px-4 py-2.5 text-end">Qty</th>
                        <th className="px-4 py-2.5 text-end">Unit Price</th>
                        <th className="px-4 py-2.5 text-end">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiry.items.map((item) => {
                        const line =
                          Number(item.unit_price ?? 0) * item.quantity;
                        return (
                          <tr
                            key={item.id}
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
                              {formatPKR(line)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[var(--bg-alt)] font-bold">
                        <td colSpan={4} className="px-4 py-3 text-end">
                          Wholesale Slab Total
                        </td>
                        <td className="px-4 py-3 text-end tabular-nums text-[var(--brand-red)]">
                          {formatPKR(orderTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Admin Status Update & Note */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleSaveNoteAndStatus}
              className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-[var(--ink)]">
                Admin Handling
              </h2>

              <Select
                label="Status"
                value={status}
                disabled={saving}
                onChange={(e) => setStatus(e.target.value as InquiryStatus)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
                <option value="closed">Closed</option>
              </Select>

              <Textarea
                label="Internal Admin Note"
                rows={4}
                disabled={saving}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Bilty number, quoted discount, follow-up notes..."
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={saving}
                loading={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Skip Order Modal */}
      <Modal
        open={skipOpen}
        onClose={() => setSkipOpen(false)}
        title="Skip / Cancel Order"
      >
        <form onSubmit={handleConfirmSkip} className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Mark order{' '}
            <strong className="font-mono-num text-[var(--ink)]">
              {inquiry.reference}
            </strong>{' '}
            as skipped? You can optionally provide a reason shown on the customer&apos;s order tracking page.
          </p>
          <Textarea
            label="Skip Reason (Optional)"
            rows={3}
            value={skipReasonInput}
            onChange={(e) => setSkipReasonInput(e.target.value)}
            placeholder="e.g. Duplicate WhatsApp request / Buyer cancelled / Item temporarily discontinued"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSkipOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={saving}>
              Confirm Skip
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Order"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Permanently delete order{' '}
            <strong className="font-mono-num text-[var(--ink)]">
              {inquiry.reference}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
