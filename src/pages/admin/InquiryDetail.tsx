import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
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
import { formatDateTime, formatPKR } from '../../lib/format';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { deleteInquiry, updateInquiry } from '../../services/inquiries';
import type { InquiryStatus } from '../../types/db';

export default function AdminInquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: inquiry, isLoading } = useInquiry(id);
  const [status, setStatus] = useState<InquiryStatus>('new');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status);
      setAdminNote(inquiry.admin_note ?? '');
    }
  }, [inquiry]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry) return;
    setSaving(true);
    try {
      await updateInquiry(inquiry.id, {
        status,
        admin_note: adminNote.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      await queryClient.invalidateQueries({ queryKey: ['inquiry', inquiry.id] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
      showToast('Inquiry status & note saved');
    } catch {
      showToast('Could not update inquiry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!inquiry) return;
    try {
      await deleteInquiry(inquiry.id);
      await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
      showToast('Inquiry deleted');
      navigate('/admin/inquiries');
    } catch {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading Inquiry...">
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </AdminLayout>
    );
  }

  if (!inquiry) {
    return (
      <AdminLayout title="Inquiry Not Found">
        <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            This inquiry could not be found.
          </p>
          <Link to="/admin/inquiries">
            <Button variant="primary">Back to Inquiries</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const orderTotal = inquiry.items.reduce(
    (sum, item) => sum + Number(item.unit_price ?? 0) * item.quantity,
    0,
  );

  // Format Pakistani local phone 03xx -> 923xx for WhatsApp reply convenience
  const cleanBuyerDigits = inquiry.phone.replace(/\D/g, '');
  const replyDigits = cleanBuyerDigits.startsWith('0')
    ? `92${cleanBuyerDigits.slice(1)}`
    : cleanBuyerDigits;
  const replyWhatsappHref = buildWhatsAppLink(
    replyDigits,
    `Assalam o Alaikum ${inquiry.name}, regarding your ASATEK request ${inquiry.reference}:`,
  );

  return (
    <AdminLayout title={`Inquiry ${inquiry.reference}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/inquiries"
            className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--brand-red)]"
          >
            ← Back to Orders &amp; Inquiries
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={replyWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-medium hover:bg-[var(--whatsapp-dark)]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </a>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
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
                    {formatDateTime(inquiry.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <InquiryChannelBadge channel={inquiry.channel} />
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">Buyer Name</dt>
                  <dd className="font-semibold text-[var(--ink)]">{inquiry.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-soft)]">Phone / WhatsApp</dt>
                  <dd className="font-semibold tabular-nums text-[var(--ink)]">
                    {inquiry.phone}
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
                          Server-Calculated Estimate
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

          {/* Admin Status Update */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleSave}
              className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4"
            >
              <h2 className="text-base font-bold text-[var(--ink)]">
                Admin Handling
              </h2>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InquiryStatus)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </Select>

              <Textarea
                label="Internal Admin Note"
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Bilty number, quoted discount, follow-up notes..."
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Inquiry"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Permanently delete inquiry{' '}
            <strong className="font-mono-num text-[var(--ink)]">
              {inquiry.reference}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
