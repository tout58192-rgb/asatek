import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { WhatsAppIcon } from '../../components/ui/WhatsAppIcon';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../hooks/useSettings';
import { whatsappSettingSchema } from '../../lib/validation';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { saveSiteSettings } from '../../services/settings';

const SETTING_KEYS = [
  'site_name',
  'logo_url',
  'tagline',
  'whatsapp_number',
  'phone',
  'email',
  'address',
  'working_hours',
  'maps_url',
  'facebook_url',
  'instagram_url',
  'youtube_url',
  'hero_title',
  'hero_subtitle',
  'hero_image_url',
  'about_title',
  'about_body',
  'about_image_url',
] as const;

type FormState = Record<string, { value_en: string; value_ur: string }>;

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>({});
  const [waError, setWaError] = useState<string | undefined>();
  const [savingWa, setSavingWa] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (settings) {
      const next: FormState = {};
      for (const k of SETTING_KEYS) {
        next[k] = {
          value_en: settings[k]?.value_en ?? '',
          value_ur: settings[k]?.value_ur ?? '',
        };
      }
      setForm(next);
    }
  }, [settings]);

  const setField = (key: string, lang: 'value_en' | 'value_ur', val: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        value_en: prev[key]?.value_en ?? '',
        value_ur: prev[key]?.value_ur ?? '',
        [lang]: val,
      },
    }));
  };

  const whatsappValue = form.whatsapp_number?.value_en ?? '';

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = whatsappSettingSchema.safeParse({
      whatsapp_number: whatsappValue,
    });
    if (!parsed.success) {
      setWaError(parsed.error.issues[0]?.message);
      return;
    }
    setWaError(undefined);
    setSavingWa(true);
    try {
      await saveSiteSettings([
        {
          key: 'whatsapp_number',
          value_en: parsed.data.whatsapp_number,
          value_ur: parsed.data.whatsapp_number,
        },
      ]);
      await queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      showToast('WhatsApp number updated across the entire site');
    } catch {
      showToast('Could not save WhatsApp number', 'error');
    } finally {
      setSavingWa(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = whatsappSettingSchema.safeParse({
      whatsapp_number: whatsappValue,
    });
    if (!parsed.success) {
      setWaError(parsed.error.issues[0]?.message);
      showToast('Please fix the WhatsApp number format first', 'error');
      return;
    }
    setWaError(undefined);
    setSavingAll(true);
    try {
      const updates = SETTING_KEYS.map((key) => ({
        key,
        value_en: form[key]?.value_en ?? '',
        value_ur: form[key]?.value_ur ?? '',
      }));
      await saveSiteSettings(updates);
      await queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      showToast('Site settings saved');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </AdminLayout>
    );
  }

  const isWaValid = whatsappSettingSchema.safeParse({
    whatsapp_number: whatsappValue,
  }).success;

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-4xl">
        {/* Top Card: WhatsApp Number */}
        <form
          onSubmit={handleSaveWhatsApp}
          className="rounded-xl border-2 border-[var(--whatsapp)]/40 bg-white p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)]">
                WhatsApp Order Number
              </h2>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                Used by the floating WhatsApp button, product inquiry links, Order List WhatsApp button, footer, and contact page.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-1 w-full">
              <Input
                label="WhatsApp Number (Country code + digits only, no + or spaces)"
                placeholder="e.g. 923001234567"
                value={whatsappValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setField('whatsapp_number', 'value_en', val);
                  const check = whatsappSettingSchema.safeParse({
                    whatsapp_number: val,
                  });
                  setWaError(
                    check.success ? undefined : check.error.issues[0]?.message,
                  );
                }}
                error={waError}
              />
            </div>

            <div className="flex items-center gap-2 sm:pt-7 shrink-0">
              <Button type="submit" variant="primary" loading={savingWa}>
                {savingWa ? 'Saving...' : 'Save Number'}
              </Button>
              {isWaValid && (
                <a
                  href={buildWhatsAppLink(
                    whatsappValue,
                    'Test message from ASATEK Admin Settings.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[var(--whatsapp)] text-white text-sm font-medium hover:bg-[var(--whatsapp-dark)] whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Test WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </form>

        {/* Remaining Settings */}
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* General */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Site Name (EN)"
                value={form.site_name?.value_en ?? ''}
                onChange={(e) => setField('site_name', 'value_en', e.target.value)}
              />
              <Input
                label="Site Name (UR)"
                dir="rtl"
                value={form.site_name?.value_ur ?? ''}
                onChange={(e) => setField('site_name', 'value_ur', e.target.value)}
              />
            </div>
            <Input
              label="Logo URL (Optional)"
              type="url"
              value={form.logo_url?.value_en ?? ''}
              onChange={(e) => setField('logo_url', 'value_en', e.target.value)}
              placeholder="https://..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tagline (EN)"
                value={form.tagline?.value_en ?? ''}
                onChange={(e) => setField('tagline', 'value_en', e.target.value)}
              />
              <Input
                label="Tagline (UR)"
                dir="rtl"
                value={form.tagline?.value_ur ?? ''}
                onChange={(e) => setField('tagline', 'value_ur', e.target.value)}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Factory Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={form.phone?.value_en ?? ''}
                onChange={(e) => setField('phone', 'value_en', e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email?.value_en ?? ''}
                onChange={(e) => setField('email', 'value_en', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Address (EN)"
                value={form.address?.value_en ?? ''}
                onChange={(e) => setField('address', 'value_en', e.target.value)}
              />
              <Input
                label="Address (UR)"
                dir="rtl"
                value={form.address?.value_ur ?? ''}
                onChange={(e) => setField('address', 'value_ur', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Working Hours (EN)"
                value={form.working_hours?.value_en ?? ''}
                onChange={(e) =>
                  setField('working_hours', 'value_en', e.target.value)
                }
              />
              <Input
                label="Working Hours (UR)"
                dir="rtl"
                value={form.working_hours?.value_ur ?? ''}
                onChange={(e) =>
                  setField('working_hours', 'value_ur', e.target.value)
                }
              />
            </div>
            <Input
              label="Google Maps Link"
              type="url"
              value={form.maps_url?.value_en ?? ''}
              onChange={(e) => setField('maps_url', 'value_en', e.target.value)}
            />
          </div>

          {/* Social */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Social Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="YouTube URL"
                type="url"
                value={form.youtube_url?.value_en ?? ''}
                onChange={(e) => setField('youtube_url', 'value_en', e.target.value)}
              />
              <Input
                label="Facebook URL"
                type="url"
                value={form.facebook_url?.value_en ?? ''}
                onChange={(e) =>
                  setField('facebook_url', 'value_en', e.target.value)
                }
              />
              <Input
                label="Instagram URL"
                type="url"
                value={form.instagram_url?.value_en ?? ''}
                onChange={(e) =>
                  setField('instagram_url', 'value_en', e.target.value)
                }
              />
            </div>
          </div>

          {/* Home Hero */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">Home Hero</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hero Title (EN)"
                value={form.hero_title?.value_en ?? ''}
                onChange={(e) =>
                  setField('hero_title', 'value_en', e.target.value)
                }
              />
              <Input
                label="Hero Title (UR)"
                dir="rtl"
                value={form.hero_title?.value_ur ?? ''}
                onChange={(e) =>
                  setField('hero_title', 'value_ur', e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Hero Subtitle (EN)"
                rows={2}
                value={form.hero_subtitle?.value_en ?? ''}
                onChange={(e) =>
                  setField('hero_subtitle', 'value_en', e.target.value)
                }
              />
              <Textarea
                label="Hero Subtitle (UR)"
                dir="rtl"
                rows={2}
                value={form.hero_subtitle?.value_ur ?? ''}
                onChange={(e) =>
                  setField('hero_subtitle', 'value_ur', e.target.value)
                }
              />
            </div>
            <Input
              label="Hero Image URL (Optional)"
              type="url"
              value={form.hero_image_url?.value_en ?? ''}
              onChange={(e) =>
                setField('hero_image_url', 'value_en', e.target.value)
              }
            />
          </div>

          {/* About */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">
              About Page Content
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="About Title (EN)"
                value={form.about_title?.value_en ?? ''}
                onChange={(e) =>
                  setField('about_title', 'value_en', e.target.value)
                }
              />
              <Input
                label="About Title (UR)"
                dir="rtl"
                value={form.about_title?.value_ur ?? ''}
                onChange={(e) =>
                  setField('about_title', 'value_ur', e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="About Story (EN)"
                rows={4}
                value={form.about_body?.value_en ?? ''}
                onChange={(e) =>
                  setField('about_body', 'value_en', e.target.value)
                }
              />
              <Textarea
                label="About Story (UR)"
                dir="rtl"
                rows={4}
                value={form.about_body?.value_ur ?? ''}
                onChange={(e) =>
                  setField('about_body', 'value_ur', e.target.value)
                }
              />
            </div>
            <Input
              label="About Factory Image URL (Optional)"
              type="url"
              value={form.about_image_url?.value_en ?? ''}
              onChange={(e) =>
                setField('about_image_url', 'value_en', e.target.value)
              }
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" loading={savingAll}>
              {savingAll ? 'Saving Settings...' : 'Save All Settings'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
