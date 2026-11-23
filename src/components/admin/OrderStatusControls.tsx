import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Loader2,
  SkipForward,
  Truck,
  X,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../lib/format';
import { getNextMenuIndex, type MenuNavKey } from '../../lib/orderHelpers';
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

interface StatusActionOption {
  value: InquiryStatus;
  label: string;
  hint: string;
  icon: typeof Check;
  textClass: string;
  iconBoxClass: string;
  hoverClass: string;
}

const STATUS_MENU_OPTIONS: StatusActionOption[] = [
  {
    value: 'confirmed',
    label: 'Confirm',
    hint: 'Approve & count toward revenue',
    icon: Check,
    textClass: 'text-emerald-800',
    iconBoxClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    hoverClass: 'hover:bg-emerald-50/75 focus-visible:bg-emerald-50/75',
  },
  {
    value: 'skipped',
    label: 'Skip',
    hint: 'Hold with optional customer reason',
    icon: SkipForward,
    textClass: 'text-amber-800',
    iconBoxClass: 'bg-amber-50 border-amber-200 text-amber-700',
    hoverClass: 'hover:bg-amber-50/80 focus-visible:bg-amber-50/80',
  },
  {
    value: 'cancelled',
    label: 'Cancel',
    hint: 'Cancel with optional customer reason',
    icon: X,
    textClass: 'text-[var(--brand-red-dark)]',
    iconBoxClass: 'bg-red-50 border-red-200 text-[var(--brand-red)]',
    hoverClass: 'hover:bg-red-50/80 focus-visible:bg-red-50/80',
  },
  {
    value: 'dispatched',
    label: 'Dispatched',
    hint: 'Handed over to transport',
    icon: Truck,
    textClass: 'text-sky-800',
    iconBoxClass: 'bg-sky-50 border-sky-200 text-sky-700',
    hoverClass: 'hover:bg-sky-50/80 focus-visible:bg-sky-50/80',
  },
  {
    value: 'completed',
    label: 'Completed',
    hint: 'Order delivered and fulfilled',
    icon: BadgeCheck,
    textClass: 'text-[#14141A]',
    iconBoxClass: 'bg-gray-100 border-gray-300 text-[#14141A]',
    hoverClass: 'hover:bg-gray-100/90 focus-visible:bg-gray-100/90',
  },
];

const TOAST_LABELS: Partial<Record<InquiryStatus, string>> = {
  confirmed: 'Order confirmed',
  skipped: 'Order skipped',
  cancelled: 'Order cancelled',
  dispatched: 'Order marked dispatched',
  completed: 'Order marked completed',
};

const DESKTOP_MENU_WIDTH = 300;

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
  const menuId = useId();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const flashTimerRef = useRef<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const [saving, setSaving] = useState(false);
  const [confirmFlash, setConfirmFlash] = useState(false);
  const [reasonModalStatus, setReasonModalStatus] = useState<
    'skipped' | 'cancelled' | null
  >(null);
  const [reasonText, setReasonText] = useState(currentSkipReason ?? '');

  const isBusy = saving || disabled;

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth < 640;
    setIsMobileSheet(mobile);
    if (mobile || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = 296;
    const margin = 12;
    const placeAbove =
      rect.bottom + estimatedHeight + margin > window.innerHeight &&
      rect.top - estimatedHeight - margin > 0;

    const top = placeAbove
      ? Math.max(margin, rect.top - estimatedHeight - 8)
      : Math.min(window.innerHeight - estimatedHeight - margin, rect.bottom + 8);

    const isRtl =
      document.documentElement.dir === 'rtl' ||
      getComputedStyle(triggerRef.current).direction === 'rtl';

    const preferredLeft = isRtl
      ? rect.left
      : rect.right - DESKTOP_MENU_WIDTH;
    const left = Math.max(
      margin,
      Math.min(preferredLeft, window.innerWidth - DESKTOP_MENU_WIDTH - margin),
    );

    setMenuPos({ top, left });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();

    const focusTimer = window.requestAnimationFrame(() => {
      const currentIdx = STATUS_MENU_OPTIONS.findIndex(
        (o) => o.value === currentStatus,
      );
      const targetIdx = currentIdx >= 0 ? currentIdx : 0;
      itemRefs.current[targetIdx]?.focus();
    });

    const handleResizeOrScroll = () => updateMenuPosition();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      }
    };
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu(false);
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [menuOpen, currentStatus, updateMenuPosition, closeMenu]);

  // Never leave menu open when saving or modal opens
  useEffect(() => {
    if (isBusy || reasonModalStatus) {
      setMenuOpen(false);
    }
  }, [isBusy, reasonModalStatus]);

  const setSavingState = (next: boolean) => {
    setSaving(next);
    onSavingChange?.(next);
  };

  const triggerConfirmSuccessFlash = () => {
    setConfirmFlash(true);
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      setConfirmFlash(false);
    }, 1300);
  };

  const commitStatus = async (
    nextStatus: InquiryStatus,
    reason?: string | null,
  ) => {
    setMenuOpen(false);
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

      showToast(TOAST_LABELS[nextStatus] ?? 'Order status updated');
      setReasonModalStatus(null);
      if (nextStatus === 'confirmed') {
        triggerConfirmSuccessFlash();
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inquiries'] }),
        queryClient.invalidateQueries({ queryKey: ['inquiry_status_counts'] }),
        queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] }),
        queryClient.invalidateQueries({ queryKey: ['sales_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['track_order'] }),
      ]);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update order status'), 'error');
    } finally {
      setSavingState(false);
    }
  };

  const handleOptionSelect = (nextStatus: InquiryStatus) => {
    if (isBusy) return;
    closeMenu(false);
    if (nextStatus === 'skipped' || nextStatus === 'cancelled') {
      setReasonText(currentSkipReason ?? '');
      setReasonModalStatus(nextStatus);
      return;
    }
    void commitStatus(nextStatus);
  };

  const handleMenuKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      e.preventDefault();
      const nextIdx = getNextMenuIndex(
        idx,
        e.key as MenuNavKey,
        STATUS_MENU_OPTIONS.length,
      );
      if (nextIdx >= 0) {
        itemRefs.current[nextIdx]?.focus();
      }
    } else if (e.key === 'Tab') {
      closeMenu(false);
    }
  };

  const handleReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonModalStatus || isBusy) return;
    void commitStatus(reasonModalStatus, reasonText);
  };

  const isCancelModal = reasonModalStatus === 'cancelled';

  const triggerClasses = confirmFlash
    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-transparent shadow-[0_4px_14px_rgba(22,163,74,0.3)]'
    : 'bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-red-dark)] text-white border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(200,16,46,0.22)] hover:from-[#D41232] hover:to-[#7A081A] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_rgba(200,16,46,0.28)]';

  const menuContent = (
    <div className="space-y-1">
      {STATUS_MENU_OPTIONS.map((opt, idx) => {
        const Icon = opt.icon;
        const isCurrent = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            type="button"
            role="menuitem"
            aria-current={isCurrent ? 'true' : undefined}
            style={{ animationDelay: `${idx * 40}ms` }}
            onKeyDown={(e) => handleMenuKeyDown(e, idx)}
            onClick={() => handleOptionSelect(opt.value)}
            className={`asatek-menu-item-in w-full min-h-[44px] flex items-center gap-3 rounded-xl px-3 py-2 text-start transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-red)] cursor-pointer ${
              isCurrent
                ? 'bg-[var(--bg-alt)] ring-1 ring-[var(--line)]'
                : opt.hoverClass
            }`}
          >
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${opt.iconBoxClass}`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-sm font-semibold leading-tight ${opt.textClass}`}>
                {opt.label}
              </span>
              <span className="block text-[11px] text-[var(--ink-soft)] truncate mt-0.5">
                {opt.hint}
              </span>
            </span>
            {isCurrent && (
              <span className="text-[11px] font-semibold text-[var(--ink-soft)] shrink-0">
                Current
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="inline-flex items-center">
        <button
          ref={triggerRef}
          type="button"
          disabled={isBusy}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          aria-label={
            confirmFlash
              ? `Order ${reference} confirmed`
              : `Update status for ${reference}`
          }
          onClick={() => {
            if (isBusy) return;
            setMenuOpen((prev) => !prev);
          }}
          className={`inline-flex items-center justify-center gap-2 rounded-lg border font-semibold whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-red)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
            compact
              ? 'min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs'
              : 'min-h-[44px] px-4 py-2.5 text-sm'
          } ${triggerClasses}`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Updating...</span>
            </>
          ) : confirmFlash ? (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Confirmed</span>
            </>
          ) : (
            <>
              <span>Update status</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>
      </div>

      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          isMobileSheet ? (
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs asatek-modal-backdrop"
              onClick={() => closeMenu(true)}
            >
              <div
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label={`Update status options for ${reference}`}
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[var(--line)] bg-white p-4 pb-6 shadow-2xl asatek-sheet-up max-h-[85vh] overflow-y-auto"
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
                <div className="flex items-center justify-between gap-3 pb-3 mb-2 border-b border-[var(--line)]">
                  <div>
                    <p className="text-sm font-bold text-[var(--ink)]">
                      Update status
                    </p>
                    <p className="font-mono-num text-xs text-[var(--ink-soft)]">
                      {reference}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close status menu"
                    onClick={() => closeMenu(true)}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {menuContent}
              </div>
            </div>
          ) : (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`Update status options for ${reference}`}
              style={{
                position: 'fixed',
                top: menuPos.top,
                left: menuPos.left,
                width: DESKTOP_MENU_WIDTH,
              }}
              className="z-50 rounded-2xl border border-[var(--line)] bg-white/95 backdrop-blur-md p-2 shadow-[0_16px_38px_-10px_rgba(20,20,26,0.22)]"
            >
              {menuContent}
            </div>
          ),
          document.body,
        )}

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
