import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Truck,
  XCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../lib/format';
import {
  updateInquiry,
  type UpdateInquiryPayload,
} from '../../services/inquiries';
import type { InquiryStatus } from '../../types/db';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface OrderStatusControlsProps {
  inquiryId: string;
  reference: string;
  currentStatus: InquiryStatus;
  currentSkipReason?: string | null;
  adminNote?: string;
  compact?: boolean;
  disabled?: boolean;
  onSavingChange?: (saving: boolean) => void;
}

const STATUS_OPTIONS: Array<{
  value: InquiryStatus;
  label: string;
  icon: typeof CheckCircle2;
  idleClass: string;
  activeClass: string;
}> = [
  {
    value: 'new',
    label: 'New',
    icon: RotateCcw,
    idleClass:
      'border-gray-300 bg-white text-[var(--ink-soft)] hover:bg-gray-100 hover:text-[var(--ink)]',
    activeClass: 'border-[var(--ink)] bg-[var(--ink)] text-white',
  },
  {
    value: 'confirmed',
    label: 'Confirm',
    icon: CheckCircle2,
    idleClass:
      'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
    activeClass: 'border-green-600 bg-green-600 text-white',
  },
  {
    value: 'skipped',
    label: 'Skip',
    icon: Ban,
    idleClass:
      'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100',
    activeClass: 'border-amber-500 bg-amber-500 text-white',
  },
  {
    value: 'cancelled',
    label: 'Cancel',
    icon: XCircle,
    idleClass:
      'border-red-300 bg-red-50 text-[var(--brand-red-dark)] hover:bg-red-100',
    activeClass:
      'border-[var(--brand-red)] bg-[var(--brand-red)] text-white',
  },
  {
    value: 'dispatched',
    label: 'Dispatched',
    icon: Truck,
    idleClass: 'border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100',
    activeClass: 'border-sky-600 bg-sky-600 text-white',
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: PackageCheck,
    idleClass:
      'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
    activeClass: 'border-emerald-700 bg-emerald-700 text-white',
  },
];

const TOAST_LABELS: Partial<Record<InquiryStatus, string>> = {
  new: 'Order marked as New',
  confirmed: 'Order confirmed',
  skipped: 'Order skipped',
  cancelled: 'Order cancelled',
  dispatched: 'Order marked dispatched',
  completed: 'Order marked completed',
};

export function OrderStatusControls({
  inquiryId,
  reference,
  currentStatus,
  currentSkipReason,
  adminNote,
  compact = false,
  disabled = false,
  onSavingChange,
}: OrderStatusControlsProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [reasonModalStatus, setReasonModalStatus] = useState<
    'skipped' | 'cancelled' | null
  >(null);
  const [reasonText, setReasonText] = useState(currentSkipReason ?? '');

  const isBusy = saving || disabled;

  const setSavingState = (next: boolean) => {
    setSaving(next);
    onSavingChange?.(next);
  };

  const commitStatus = async (
    nextStatus: InquiryStatus,
    reason?: string | null,
  ) => {
    setSavingState(true);
    try {
      const payload: UpdateInquiryPayload = {
        status: nextStatus,
        skip_reason:
          nextStatus === 'skipped' || nextStatus === 'cancelled'
            ? reason?.trim() || null
            : null,
        ...(adminNote !== undefined
          ? { admin_note: adminNote.trim() || null }
          : {}),
      };

      await updateInquiry(inquiryId, payload);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inquiries'] }),
        queryClient.invalidateQueries({ queryKey: ['inquiry_status_counts'] }),
        queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] }),
        queryClient.invalidateQueries({ queryKey: ['sales_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['track_order'] }),
      ]);

      showToast(TOAST_LABELS[nextStatus] ?? 'Order status updated');
      setReasonModalStatus(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update order status'), 'error');
    } finally {
      setSavingState(false);
    }
  };

  const handleOptionClick = (nextStatus: InquiryStatus) => {
    if (isBusy) return;
    if (nextStatus === 'skipped' || nextStatus === 'cancelled') {
      setReasonText(currentSkipReason ?? '');
      setReasonModalStatus(nextStatus);
      return;
    }
    if (nextStatus === currentStatus) return;
    void commitStatus(nextStatus);
  };

  const handleReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonModalStatus || isBusy) return;
    void commitStatus(reasonModalStatus, reasonText);
  };

  const isCancelModal = reasonModalStatus === 'cancelled';

  return (
    <>
      <div
        role="group"
        aria-label={`Status actions for ${reference}`}
        className={
          compact
            ? 'grid grid-cols-3 gap-1 w-[252px]'
            : 'flex flex-wrap items-center gap-2'
        }
      >
        {STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = currentStatus === opt.value;
          const allowReopenReason =
            opt.value === 'skipped' || opt.value === 'cancelled';
          const btnDisabled = isBusy || (active && !allowReopenReason);

          return (
            <button
              key={opt.value}
              type="button"
              disabled={btnDisabled}
              aria-pressed={active}
              onClick={() => handleOptionClick(opt.value)}
              className={`inline-flex items-center justify-center gap-0.5 rounded border font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                compact
                  ? 'px-1 py-0.5 text-[10px]'
                  : 'px-3 py-1.5 text-xs min-h-[36px] rounded-md gap-1'
              } ${active ? opt.activeClass : opt.idleClass}`}
            >
              <Icon className={compact ? 'w-2.5 h-2.5 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <Modal
        open={Boolean(reasonModalStatus)}
        onClose={() => {
          if (!isBusy) setReasonModalStatus(null);
        }}
        title={isCancelModal ? 'Cancel Order' : 'Skip Order'}
      >
        <form onSubmit={handleReasonSubmit} className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            {isCancelModal ? 'Mark order ' : 'Skip order '}
            <strong className="font-mono-num text-[var(--ink)]">
              {reference}
            </strong>
            {isCancelModal
              ? ' as cancelled? You can optionally provide a reason shown to the customer.'
              : '? You can optionally provide a reason shown to the customer.'}
          </p>
          <Textarea
            label={
              isCancelModal
                ? 'Cancellation Reason (Optional)'
                : 'Skip Reason (Optional)'
            }
            rows={3}
            disabled={isBusy}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder={
              isCancelModal
                ? 'e.g. Cancelled at buyer request / Out of stock'
                : 'e.g. Duplicate request / Awaiting revised quantity'
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() => setReasonModalStatus(null)}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant={isCancelModal ? 'danger' : 'secondary'}
              loading={saving}
              disabled={isBusy}
              className={
                !isCancelModal
                  ? '!bg-amber-500 !text-white !border-amber-500 hover:!bg-amber-600'
                  : ''
              }
            >
              {isCancelModal ? 'Confirm Cancel' : 'Confirm Skip'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
