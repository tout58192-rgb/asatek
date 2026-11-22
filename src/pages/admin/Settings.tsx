import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ImageInput } from '../../components/admin/ImageInput';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { WhatsAppIcon } from '../../components/ui/WhatsAppIcon';
import { useToast } from '../../contexts/ToastContext';
import { useBanners } from '../../hooks/useBanners';
import { useSettings } from '../../hooks/useSettings';
import { getErrorMessage } from '../../lib/format';
import { whatsappSettingSchema } from '../../lib/validation';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import {
  createBanner,
  deleteBanner,
  updateBanner,
} from '../../services/banners';
import { saveSiteSettings } from '../../services/settings';
import { deleteStorageImageByPublicUrl } from '../../services/storage';
import type { HomeBanner } from '../../types/db';

const SETTING_KEYS = [
  'site_name',
  'logo_url',
  'favicon_url',
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

const IMAGE_SETTING_KEYS = [
  'logo_url',
  'favicon_url',
  'hero_image_url',
  'about_image_url',
] as const;

type FormState = Record<string, { value_en: string; value_ur: string }>;

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const { data: banners, isLoading: bannersLoading } = useBanners(true);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>({});
  const [waError, setWaError] = useState<string | undefined>();
  const [savingWa, setSavingWa] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  // Home banner modal state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerTitleEn, setBannerTitleEn] = useState('');
  const [bannerTitleUr, setBannerTitleUr] = useState('');
  const [bannerSubEn, setBannerSubEn] = useState('');
  const [bannerSubUr, setBannerSubUr] = useState('');
  const [bannerBtnEn, setBannerBtnEn] = useState('');
  const [bannerBtnUr, setBannerBtnUr] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerSort, setBannerSort] = useState(1);
  const [bannerActive, setBannerActive] = useState(true);
  const [savingBanner, setSavingBanner] = useState(false);

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
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save WhatsApp number'), 'error');
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

      // Clean up replaced or cleared managed storage images after DB save succeeds
      const cleanupUrls = IMAGE_SETTING_KEYS.map((key) => {
        const prevUrl = settings?.[key]?.value_en ?? '';
        const nextUrl = form[key]?.value_en ?? '';
        return prevUrl && prevUrl !== nextUrl ? prevUrl : '';
      }).filter(Boolean);
      await Promise.all(cleanupUrls.map((u) => deleteStorageImageByPublicUrl(u)));

      await queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      showToast('Site settings saved');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save settings'), 'error');
    } finally {
      setSavingAll(false);
    }
  };

  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerImageUrl('');
    setBannerTitleEn('');
    setBannerTitleUr('');
    setBannerSubEn('');
    setBannerSubUr('');
    setBannerBtnEn('');
    setBannerBtnUr('');
    setBannerLink('/products');
    setBannerSort((banners?.length ?? 0) + 1);
    setBannerActive(true);
    setBannerModalOpen(true);
  };

  const openEditBanner = (b: HomeBanner) => {
    setEditingBanner(b);
    setBannerImageUrl(b.image_url ?? '');
    setBannerTitleEn(b.title_en ?? '');
    setBannerTitleUr(b.title_ur ?? '');
    setBannerSubEn(b.subtitle_en ?? '');
    setBannerSubUr(b.subtitle_ur ?? '');
    setBannerBtnEn(b.button_text_en ?? '');
    setBannerBtnUr(b.button_text_ur ?? '');
    setBannerLink(b.button_link ?? '');
    setBannerSort(b.sort_order);
    setBannerActive(b.is_active);
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImageUrl.trim()) {
      showToast('Please upload or paste a banner image URL.', 'error');
      return;
    }
    setSavingBanner(true);
    try {
      const payload = {
        image_url: bannerImageUrl.trim(),
        title_en: bannerTitleEn.trim() || null,
        title_ur: bannerTitleUr.trim() || null,
        subtitle_en: bannerSubEn.trim() || null,
        subtitle_ur: bannerSubUr.trim() || null,
        button_text_en: bannerBtnEn.trim() || null,
        button_text_ur: bannerBtnUr.trim() || null,
        button_link: bannerLink.trim() || null,
        sort_order: bannerSort,
        is_active: bannerActive,
      };
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
        if (
          editingBanner.image_url &&
          editingBanner.image_url !== payload.image_url
        ) {
          await deleteStorageImageByPublicUrl(editingBanner.image_url);
        }
        showToast('Home banner updated');
      } else {
        await createBanner(payload);
        showToast('Home banner added');
      }
      await queryClient.invalidateQueries({ queryKey: ['home_banners'] });
      setBannerModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save home banner'), 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (b: HomeBanner) => {
    try {
      await deleteBanner(b);
      await queryClient.invalidateQueries({ queryKey: ['home_banners'] });
      showToast('Home banner deleted');
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not delete banner'), 'error');
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
                Used by the floating WhatsApp button, product WhatsApp buttons, Order List WhatsApp button, footer, and contact page.
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

        {/* Home Banners Manager */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                Home Page Banners
              </h2>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                Promotional or factory showcase banners shown on the home page.
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={openCreateBanner}>
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </Button>
          </div>

          {bannersLoading ? (
            <div className="h-24 rounded-lg skeleton-shimmer" />
          ) : (banners ?? []).length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)] py-4 text-center border border-dashed border-[var(--line)] rounded-lg">
              No home banners configured yet. Click &ldquo;Add Banner&rdquo; to upload one.
            </p>
          ) : (
            <div className="space-y-3">
              {(banners ?? []).map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--line)] p-3 bg-[var(--bg-alt)]/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt={b.title_en || 'Banner'}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-24 h-14 rounded-md object-cover border border-[var(--line)] shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-24 h-14 rounded-md border border-[var(--line)] bg-white flex items-center justify-center text-[var(--ink-soft)] shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--ink)] truncate">
                          {b.title_en || '(Image-only banner)'}
                        </p>
                        {b.is_active ? (
                          <Badge tone="green">Active</Badge>
                        ) : (
                          <Badge tone="neutral">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--ink-soft)] truncate">
                        Order #{b.sort_order}
                        {b.button_link ? ` · Link: ${b.button_link}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditBanner(b)}
                      aria-label={`Edit banner ${b.title_en || b.id}`}
                      className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg hover:bg-white cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(b)}
                      aria-label={`Delete banner ${b.title_en || b.id}`}
                      className="p-2 text-[var(--ink-soft)] hover:text-[var(--brand-red)] rounded-lg hover:bg-[var(--brand-red-light)] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remaining Settings */}
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* General */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[var(--ink)]">General &amp; Branding</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageInput
                label="Site Logo (Optional)"
                value={form.logo_url?.value_en ?? ''}
                onChange={(url) => setField('logo_url', 'value_en', url)}
                bucket="site-assets"
                pathPrefix="site"
                fileNameHint="logo"
                aspect="square"
                deleteOnRemove={false}
              />
              <ImageInput
                label="Favicon (Optional)"
                value={form.favicon_url?.value_en ?? ''}
                onChange={(url) => setField('favicon_url', 'value_en', url)}
                bucket="site-assets"
                pathPrefix="site"
                fileNameHint="favicon"
                aspect="square"
                deleteOnRemove={false}
              />
            </div>

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
            <ImageInput
              label="Hero Image (Optional)"
              value={form.hero_image_url?.value_en ?? ''}
              onChange={(url) => setField('hero_image_url', 'value_en', url)}
              bucket="site-assets"
              pathPrefix="site"
              fileNameHint="hero"
              aspect="wide"
              deleteOnRemove={false}
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
            <ImageInput
              label="About Factory Image (Optional)"
              value={form.about_image_url?.value_en ?? ''}
              onChange={(url) => setField('about_image_url', 'value_en', url)}
              bucket="site-assets"
              pathPrefix="site"
              fileNameHint="about"
              aspect="wide"
              deleteOnRemove={false}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" loading={savingAll}>
              {savingAll ? 'Saving Settings...' : 'Save All Settings'}
            </Button>
          </div>
        </form>
      </div>

      {/* Home Banner Modal */}
      <Modal
        open={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        title={editingBanner ? 'Edit Home Banner' : 'Add Home Banner'}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4">
          <ImageInput
            label="Banner Image"
            value={bannerImageUrl}
            onChange={setBannerImageUrl}
            bucket="site-assets"
            pathPrefix="site"
            fileNameHint="banner"
            aspect="wide"
            deleteOnRemove={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Title (EN)"
              value={bannerTitleEn}
              onChange={(e) => setBannerTitleEn(e.target.value)}
            />
            <Input
              label="Title (UR)"
              dir="rtl"
              value={bannerTitleUr}
              onChange={(e) => setBannerTitleUr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Subtitle (EN)"
              value={bannerSubEn}
              onChange={(e) => setBannerSubEn(e.target.value)}
            />
            <Input
              label="Subtitle (UR)"
              dir="rtl"
              value={bannerSubUr}
              onChange={(e) => setBannerSubUr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Button Text (EN)"
              placeholder="e.g. Browse Solar Models"
              value={bannerBtnEn}
              onChange={(e) => setBannerBtnEn(e.target.value)}
            />
            <Input
              label="Button Text (UR)"
              dir="rtl"
              value={bannerBtnUr}
              onChange={(e) => setBannerBtnUr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Button Link"
              placeholder="/products or https://..."
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
            />
            <Input
              label="Sort Order"
              type="number"
              value={bannerSort}
              onChange={(e) =>
                setBannerSort(parseInt(e.target.value, 10) || 1)
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-[var(--ink)] cursor-pointer">
            <input
              type="checkbox"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
              className="w-4 h-4 accent-[var(--brand-red)]"
            />
            <span>Active (visible on home page)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setBannerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingBanner}>
              {savingBanner ? 'Saving...' : 'Save Banner'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
