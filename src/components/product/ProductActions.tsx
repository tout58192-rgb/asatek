import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';
import { useQuote } from '../../contexts/QuoteContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';
import { buildProductWhatsAppMessage, buildWhatsAppLink } from '../../lib/whatsapp';
import { submitInquiry } from '../../services/inquiries';
import type { ProductWithDetails } from '../../types/db';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

interface ProductActionsProps {
  product: ProductWithDetails;
  quantity?: number;
  size?: 'sm' | 'lg';
  className?: string;
}

function openExternalAnchor(url: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function ProductActions({
  product,
  quantity,
  size = 'sm',
  className = '',
}: ProductActionsProps) {
  const { t, pick } = useI18n();
  const { addItem } = useQuote();
  const { showToast } = useToast();
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();
  const [waSubmitting, setWaSubmitting] = useState(false);

  const name = pick(product as unknown as Record<string, unknown>, 'name');
  const qty = Math.max(product.moq, quantity ?? product.moq);
  const primaryImage =
    product.images.find((i) => i.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    null;

  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      quantity: qty,
      snapshot_name_en: product.name_en,
      snapshot_name_ur: product.name_ur,
      snapshot_sku: product.sku,
      snapshot_moq: product.moq,
      snapshot_image_url: primaryImage,
    });
    showToast(t('common.addedToOrder'), 'success', {
      label: t('common.viewOrderList'),
      to: '/quote',
    });
  };

  const handleWhatsAppOrder = async () => {
    setWaSubmitting(true);
    let saveFailed = false;
    try {
      await submitInquiry({
        type: 'quote',
        channel: 'whatsapp',
        anonymous: true,
        name: 'WhatsApp visitor',
        phone: '0000000000',
        message: `WhatsApp quick order: ${product.name_en} (${product.sku}) x ${qty}`,
        items: [
          {
            product_id: product.id,
            quantity: qty,
          },
        ],
      });
      await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
    } catch (err) {
      saveFailed = true;
      console.warn('Could not save WhatsApp product order:', err);
    } finally {
      setWaSubmitting(false);
    }

    if (!whatsappNumber) {
      showToast(t('common.whatsappNotConfigured'), 'error');
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${origin}/products/${product.slug}`;
    const msg = buildProductWhatsAppMessage({
      name: product.name_en,
      sku: product.sku,
      quantity: qty,
      productUrl,
    });
    openExternalAnchor(buildWhatsAppLink(whatsappNumber, msg));

    if (saveFailed) {
      showToast(t('common.whatsappOrderFallbackNotice'), 'info');
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button
        variant="primary"
        size={size}
        onClick={handleAdd}
        className="w-full"
        aria-label={`${t('common.addToOrder')}: ${name}`}
      >
        <Plus className="w-4 h-4 shrink-0" />
        <span>{t('common.addToOrder')}</span>
      </Button>

      <Button
        variant="whatsapp"
        size={size}
        loading={waSubmitting}
        onClick={handleWhatsAppOrder}
        className="w-full"
        aria-label={`${t('common.orderOnWhatsapp')}: ${name}`}
      >
        <WhatsAppIcon className="w-4 h-4 shrink-0" />
        <span>{t('common.orderOnWhatsapp')}</span>
      </Button>
    </div>
  );
}
