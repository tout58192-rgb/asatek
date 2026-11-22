import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useI18n } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../hooks/useSettings';
import { pickSetting } from '../lib/i18n';
import { contactFormSchema, type ContactFormValues } from '../lib/validation';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { submitInquiry } from '../services/inquiries';

export default function Contact() {
  const { lang, t } = useI18n();
  const { data: settings } = useSettings();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const address = pickSetting(settings, 'address', lang, '');
  const phone = pickSetting(settings, 'phone', lang, '');
  const email = pickSetting(settings, 'email', 'en', '');
  const hours = pickSetting(settings, 'working_hours', lang, '');
  const mapsUrl = pickSetting(settings, 'maps_url', 'en', '');
  const whatsappNumber = pickSetting(settings, 'whatsapp_number', 'en', '');

  const whatsappHref = whatsappNumber
    ? buildWhatsAppLink(whatsappNumber, 'Assalam o Alaikum ASATEK, I have a question.')
    : '#';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', phone: '', message: '', website: '' },
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (values.website && values.website.trim().length > 0) {
      reset();
      showToast(t('contact.successToast', { ref: 'ASK-RECEIVED' }), 'success');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitInquiry({
        type: 'contact',
        channel: 'website',
        name: values.name,
        phone: values.phone,
        message: values.message,
      });
      reset();
      await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
      showToast(t('contact.successToast', { ref: res.reference }), 'success');
    } catch {
      showToast(t('contact.errorToast'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title={t('nav.contact')} description={t('contact.subtitle')}>
      <div className="bg-[var(--bg-alt)] border-b border-[var(--line)] py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            {t('contact.title')}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[var(--ink-soft)]">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--line)] bg-white p-6 space-y-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">
              {t('contact.detailsTitle')}
            </h2>

            <div className="space-y-4 text-sm">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--brand-red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      {t('contact.addressLabel')}
                    </p>
                    <p className="text-[var(--ink-soft)] mt-0.5">{address}</p>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--brand-red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      {t('contact.phoneLabel')}
                    </p>
                    <p className="text-[var(--ink-soft)] mt-0.5 tabular-nums" dir="ltr">
                      {phone}
                    </p>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--brand-red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      {t('contact.emailLabel')}
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="text-[var(--brand-red)] hover:underline mt-0.5 block"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}

              {hours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[var(--brand-red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      {t('contact.hoursLabel')}
                    </p>
                    <p className="text-[var(--ink-soft)] mt-0.5">{hours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              {whatsappNumber && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-medium hover:bg-[var(--whatsapp-dark)]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{t('common.whatsappUs')}</span>
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-[var(--line)] bg-white text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('contact.openMaps')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-[var(--ink)]">
                {t('contact.formTitle')}
              </h2>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website-hp">Website</label>
                <input
                  id="contact-website-hp"
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

              <Textarea
                label={t('contact.messageLabel')}
                placeholder={t('contact.messagePlaceholder')}
                rows={4}
                required
                error={errors.message?.message}
                {...register('message')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
              >
                {submitting ? t('contact.sending') : t('contact.sendMessage')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
