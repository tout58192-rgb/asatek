import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Star, Trash2, Upload } from 'lucide-react';
import { uploadStorageImage } from '../../services/storage';
import { Button } from '../ui/Button';

export interface EditableImageItem {
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageUploaderProps {
  images: EditableImageItem[];
  onChange: (next: EditableImageItem[]) => void;
  pathPrefix: string;
}

export function ImageUploader({
  images,
  onChange,
  pathPrefix,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (list: EditableImageItem[]): EditableImageItem[] => {
    const hasPrimary = list.some((i) => i.is_primary);
    return list.map((item, idx) => ({
      ...item,
      sort_order: idx,
      is_primary: hasPrimary ? item.is_primary : idx === 0,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const added: EditableImageItem[] = [];
      for (const file of Array.from(files)) {
        const publicUrl = await uploadStorageImage(
          'product-images',
          pathPrefix,
          file,
        );
        added.push({
          image_url: publicUrl,
          sort_order: images.length + added.length,
          is_primary: images.length === 0 && added.length === 0,
        });
      }
      onChange(normalize([...images, ...added]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError('Enter a valid https:// or http:// image URL');
      return;
    }
    setError(null);
    onChange(
      normalize([
        ...images,
        {
          image_url: trimmed,
          sort_order: images.length,
          is_primary: images.length === 0,
        },
      ]),
    );
    setUrlInput('');
  };

  const setPrimary = (index: number) => {
    onChange(
      images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    );
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    onChange(normalize(copy));
  };

  const remove = (index: number) => {
    const copy = images.filter((_, i) => i !== index);
    onChange(normalize(copy));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg-alt)] text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-red)] cursor-pointer whitespace-nowrap">
          <Upload className="w-4 h-4 text-[var(--brand-red)]" />
          <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="flex flex-1 gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste external image URL (https://...)"
            className="flex-1 min-h-[44px] rounded-lg border border-[var(--line)] bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-[var(--brand-red)]"
          />
          <Button type="button" variant="secondary" onClick={handleAddUrl}>
            <Plus className="w-4 h-4" />
            <span>Add URL</span>
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-[var(--brand-red)]">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={`${img.image_url}-${idx}`}
              className={`rounded-xl border p-2 bg-white space-y-2 ${
                img.is_primary
                  ? 'border-[var(--brand-red)] ring-2 ring-[var(--brand-red)]/15'
                  : 'border-[var(--line)]'
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-[var(--bg-alt)]">
                <img
                  src={img.image_url}
                  alt={`Product ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  title="Set as primary image"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                    img.is_primary
                      ? 'bg-[var(--brand-red-light)] text-[var(--brand-red)]'
                      : 'text-[var(--ink-soft)] hover:bg-[var(--bg-alt)]'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>{img.is_primary ? 'Primary' : 'Make Primary'}</span>
                </button>
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    aria-label="Move image left"
                    className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => move(idx, 1)}
                    aria-label="Move image right"
                    className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label="Remove image"
                    className="p-1 text-[var(--ink-soft)] hover:text-[var(--brand-red)] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
