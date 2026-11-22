import { useI18n } from '../../contexts/LanguageContext';
import { useSettings } from '../../hooks/useSettings';
import { pickSetting } from '../../lib/i18n';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { mockStore } from '../../services/mockData';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

export function WhatsAppFloat() {
  const { t } = useI18n();
  const { data: settings } = useSettings();
  const fallbackNumber = mockStore.settings.whatsapp_number?.value_en || '923000000000';
  const number = pickSetting(settings, 'whatsapp_number', 'en', fallbackNumber) || fallbackNumber;

  const href = buildWhatsAppLink(
    number,
    'Assalam o Alaikum ASATEK Sales, I would like wholesale product details and pricing.',
  );

  const label = t('common.whatsappSupport');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-testid="whatsapp-float"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 min-h-[48px] px-4 py-2.5 rounded-xl bg-[var(--whatsapp)] text-white text-sm font-semibold shadow-lg hover:bg-[var(--whatsapp-dark)] transition-all duration-150 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--whatsapp)]"
    >
      <WhatsAppIcon className="w-5 h-5 shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}
