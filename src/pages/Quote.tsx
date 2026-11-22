import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductImageSlot } from '../components/product/ProductImageSlot';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useI18n } from '../contexts/LanguageContext';
import { useQuote } from '../contexts/QuoteContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../hooks/useSettings';
import { formatPKR, getErrorMessage } from '../lib/format';
import { pickSetting } from '../lib/i18n';
import { estimateLineTotal } from '../lib/pricing';
import { buyerOrderSchema, type BuyerOrderFormValues } from '../lib/validation';
import { buildOrderWhatsAppMessage, buildWhatsAppLink } from '../lib/whatsapp';
import { submitInquiry } from '../services/inquiries';
import { getProductsByIds } from '../services/products';
import type { InquiryChannel } from '../types/db';

interface SuccessState {
  reference: string;
  channel: InquiryChannel;
  whatsappUrl?: string;
  saveFailedNotice?: string;
}

export default function Quote() {
  const { t, pick } = useI18n();
  const { items, updateQuantity, removeItem, clearQuote } = useQuote();
  const { showToast } = useToast();
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();

  const [submittingChannel, setSubmittingChannel] = useState<InquiryChannel | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const productIds = items.map((i) => i.product_id);
  const { data: liveProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['quote_products', productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
    staleTime: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerOrderFormValues>({
    resolver: zodResolver(buyerOrderSchema),
    defaultValues: {
      name: '',
      phone: '',
      city: '',
      business_name: '',
      message: '',
      website: '',
    },
  });

  useEffect(() => {
    if (items.length > 0 && success) {
      setSuccess(null);
    }
  }, [items.length, success]);

  const productMap = new Map((liveProducts ?? []).map((p) => [p.id, p]));
  const hasUnavailableItems =
    !productsLoading &&
    items.some((entry) => {
      const p = productMap.get(entry.product_id);
      return !p || !p.is_active;
    });

  const estimatedTotal = items.reduce((sum, entry) => {
    const p = productMap.get(entry.product_id);
    if (!p || !p.is_active) return sum;
    const { lineTotal } = estimateLineTotal(p.price_tiers, entry.quantity);
    return sum + lineTotal;
  }, 0);

  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');

  const handleOrderSubmit =
    (channel: InquiryChannel) =>
    async (values: BuyerOrderFormValues) => {
      // Honeypot silent success
      if (values.website && values.website.trim().length > 0) {
        clearQuote();
        setSuccess({ reference: 'ASK-RECEIVED', channel });
        return;
      }

      if (hasUnavailableItems) {
        showToast(t('quote.unavailableWarning'), 'error');
        return;
      }

      setSubmittingChannel(channel);
      setSubmitError(null);

      const whatsappLines = items.map((entry) => {
        const p = productMap.get(entry.product_id);
        return {
          productName: p ? p.name_en : entry.snapshot_name_en,
          sku: p ? p.sku : entry.snapshot_sku,
          quantity: entry.quantity,
        };
      });

      try {
        const result = await submitInquiry({
          type: 'quote',
          channel,
          name: values.name,
          phone: values.phone,
          city: values.city,
          business_name: values.business_name || undefined,
          message: values.message || undefined,
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        });

        let waUrl: string | undefined;
        if (channel === 'whatsapp' && whatsappNumber) {
          const msg = buildOrderWhatsAppMessage({
            reference: result.reference,
            name: values.name,
            city: values.city,
            phone: values.phone,
            items: whatsappLines,
            message: values.message || undefined,
          });
          waUrl = buildWhatsAppLink(whatsappNumber, msg);
          const anchor = document.createElement('a');
          anchor.href = waUrl;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        }

        clearQuote();
        await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
        setSuccess({
          reference: result.reference,
          channel,
          whatsappUrl: waUrl,
        });
      } catch (err) {
        const errMsg = getErrorMessage(err, t('quote.submitError'));
        if (channel === 'whatsapp' && whatsappNumber) {
          const msg = buildOrderWhatsAppMessage({
            reference: 'NEW-ORDER',
            name: values.name,
            city: values.city,
            phone: values.phone,
            items: whatsappLines,
            message: values.message || undefined,
          });
          const waUrl = buildWhatsAppLink(whatsappNumber, msg);
          const anchor = document.createElement('a');
          anchor.href = waUrl;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);

          clearQuote();
          setSuccess({
            reference: 'WHATSAPP-DIRECT',
            channel: 'whatsapp',
            whatsappUrl: waUrl,
            saveFailedNotice: errMsg,
          });
        } else {
          setSubmitError(errMsg);
          showToast(errMsg, 'error');
        }
      } finally {
        setSubmittingChannel(null);
      }
    };

  if (success) {
    return (
      <Layout title={t('quote.successTitle')}>
        <div className="max-w-[720px] mx-auto px-4 md:px-6 py-14">
          <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center space-y-5 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[var(--accent-green)] border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">
              {t('quote.successTitle')}
            </h1>
            <div className="inline-block rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] px-5 py-3">
              <p className="text-xs text-[var(--ink-soft)]">
                {t('quote.successRef')}
              </p>
              <p
                data-testid="order-reference-code"
                className="font-mono-num text-xl font-bold text-[var(--brand-red)] mt-0.5"
              >
                {success.reference}
              </p>
            </div>
            <p className="text-sm sm:text-base text-[var(--ink-soft)] max-w-md mx-auto">
              {success.saveFailedNotice
                ? `${t('quote.whatsappSaveWarning')} (${success.saveFailedNotice})`
                : success.channel === 'whatsapp'
                  ? t('quote.successWhatsappNote')
                  : t('quote.successBody')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {success.whatsappUrl && (
                <a
                  href={success.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--whatsapp)] text-white font-medium text-sm hover:bg-[var(--whatsapp-dark)]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{t('quote.submitWhatsapp')}</span>
                </a>
              )}
              <Link to="/products">
                <Button variant="primary">{t('quote.startNewOrder')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('quote.title')} description={t('quote.subtitle')}>
      <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            {t('quote.title')}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--ink-soft)]">
            {t('quote.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        {items.length === 0 ? (
          <EmptyState
            title={t('quote.emptyTitle')}
            description={t('quote.emptyDesc')}
            action={
              <Link to="/products">
                <Button variant="primary">{t('common.browseProducts')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-7 space-y-4">
              {hasUnavailableItems && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-[var(--brand-red-light)] p-3.5 text-sm text-[var(--brand-red-dark)]">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{t('quote.unavailableWarning')}</span>
                </div>
              )}

              <div className="rounded-xl border border-[var(--line)] bg-white divide-y divide-[var(--line)] overflow-hidden">
                {items.map((entry) => {
                  const live = productMap.get(entry.product_id);
                  const isAvailable = productsLoading || (live && live.is_active);
                  const displayName = live
                    ? pick(live as unknown as Record<string, unknown>, 'name')
                    : pick(
                        {
                          name_en: entry.snapshot_name_en,
                          name_ur: entry.snapshot_name_ur,
                        },
                        'name',
                      );
                  const sku = live ? live.sku : entry.snapshot_sku;
                  const moq = live ? live.moq : entry.snapshot_moq;
                  const imgUrl =
                    live?.images.find((i) => i.is_primary)?.image_url ||
                    live?.images[0]?.image_url ||
                    entry.snapshot_image_url ||
                    null;

                  const { unitPrice, lineTotal } = live
                    ? estimateLineTotal(live.price_tiers, entry.quantity)
                    : { unitPrice: 0, lineTotal: 0 };

                  return (
                    <div
                      key={entry.product_id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-lg border border-[var(--line)] overflow-hidden shrink-0">
                          <ProductImageSlot
                            imageUrl={imgUrl}
                            alt={displayName}
                            sku={sku}
                            categoryIcon={live?.category?.icon}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          {live ? (
                            <Link
                              to={`/products/${live.slug}`}
                              className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand-red)] line-clamp-2"
                            >
                              {displayName}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              {displayName}
                            </p>
                          )}
                          <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-0.5">
                            {sku} · {t('common.moq')}: {moq}
                          </p>
                          {!isAvailable && (
                            <p className="text-xs font-semibold text-[var(--brand-red)] mt-1">
                              {t('quote.unavailableBadge')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${displayName}`}
                            disabled={entry.quantity <= moq}
                            onClick={() =>
                              updateQuantity(
                                entry.product_id,
                                Math.max(moq, entry.quantity - 1),
                              )
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-alt)] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            aria-label={`Quantity for ${displayName}`}
                            min={moq}
                            max={1000000}
                            value={entry.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!Number.isNaN(val)) {
                                updateQuantity(entry.product_id, val);
                              }
                            }}
                            className="w-16 h-9 text-center text-sm font-semibold tabular-nums border-x border-[var(--line)] focus:outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${displayName}`}
                            onClick={() =>
                              updateQuantity(entry.product_id, entry.quantity + 1)
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-alt)] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-end min-w-[100px]">
                          <p className="text-sm font-bold text-[var(--ink)] tabular-nums">
                            {live ? formatPKR(lineTotal) : '—'}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                            {live ? `${formatPKR(unitPrice)} ${t('common.perUnit')}` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(entry.product_id)}
                          aria-label={`${t('common.remove')} ${displayName}`}
                          className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] rounded-lg hover:bg-[var(--brand-red-light)] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Total Box */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {t('quote.estimatedTotal')}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    {t('quote.estimateNote')}
                  </p>
                </div>
                <p
                  data-testid="quote-estimated-total"
                  className="text-2xl font-bold text-[var(--brand-red)] tabular-nums"
                >
                  {formatPKR(estimatedTotal)}
                </p>
              </div>
            </div>

            {/* Buyer Form Column */}
            <div className="lg:col-span-5">
              <form
                noValidate
                className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-[var(--ink)]">
                  {t('quote.buyerHeading')}
                </h2>

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="quote-website-hp">Website</label>
                  <input
                    id="quote-website-hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register('website')}
                  />
                </div>

                <Input
                  label={t('quote.nameLabel')}
                  placeholder={t('quote.namePlaceholder')}
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label={t('quote.phoneLabel')}
                  placeholder={t('quote.phonePlaceholder')}
                  type="tel"
                  required
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label={t('quote.cityLabel')}
                  placeholder={t('quote.cityPlaceholder')}
                  required
                  error={errors.city?.message}
                  {...register('city')}
                />

                <Input
                  label={t('quote.businessLabel')}
                  placeholder={t('quote.businessPlaceholder')}
                  error={errors.business_name?.message}
                  {...register('business_name')}
                />

                <Textarea
                  label={t('quote.messageLabel')}
                  placeholder={t('quote.messagePlaceholder')}
                  rows={3}
                  error={errors.message?.message}
                  {...register('message')}
                />

                {submitError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-[var(--brand-red-light)] px-3.5 py-2.5 text-xs font-medium text-[var(--brand-red-dark)]"
                  >
                    {submitError}
                  </div>
                )}

                <div className="pt-2 space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={Boolean(submittingChannel) || hasUnavailableItems}
                    onClick={handleSubmit(handleOrderSubmit('website'))}
                  >
                    {submittingChannel === 'website'
                      ? t('quote.submitting')
                      : t('quote.submitWebsite')}
                  </Button>

                  <Button
                    type="button"
                    variant="whatsapp"
                    size="lg"
                    className="w-full"
                    disabled={
                      Boolean(submittingChannel) ||
                      hasUnavailableItems ||
                      !whatsappNumber
                    }
                    onClick={handleSubmit(handleOrderSubmit('whatsapp'))}
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>
                      {submittingChannel === 'whatsapp'
                        ? t('quote.submitting')
                        : t('quote.submitWhatsapp')}
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
