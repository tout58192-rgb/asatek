import { ArrowDown, ArrowUp, ImageOff, Star, Trash2 } from 'lucide-react';
import { ImageInput } from './ImageInput';

export interface EditableImageItem {
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageUploaderProps {
  images: EditableImageItem[];
  onChange: (next: EditableImageItem[]) => void;
  pathPrefix: string;
  onRemovedUrl?: (url: string) => void;
}

export function ImageUploader({
  images,
  onChange,
  pathPrefix,
  onRemovedUrl,
}: ImageUploaderProps) {
  const normalize = (list: EditableImageItem[]): EditableImageItem[] => {
    const hasPrimary = list.some((i) => i.is_primary);
    return list.map((item, idx) => ({
      ...item,
      sort_order: idx,
      is_primary: hasPrimary ? item.is_primary : idx === 0,
    }));
  };

  const handleAddUrls = (urls: string[]) => {
    const added: EditableImageItem[] = urls.map((url, idx) => ({
      image_url: url,
      sort_order: images.length + idx,
      is_primary: images.length === 0 && idx === 0,
    }));
    onChange(normalize([...images, ...added]));
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
    const target = images[index];
    const copy = images.filter((_, i) => i !== index);
    onChange(normalize(copy));
    if (target?.image_url) {
      onRemovedUrl?.(target.image_url);
    }
  };

  return (
    <div className="space-y-4">
      <ImageInput
        value=""
        onChange={(url) => {
          if (url) handleAddUrls([url]);
        }}
        bucket="product-images"
        pathPrefix={pathPrefix}
        clearAfterPick
        multipleFiles
        onMultipleUploaded={handleAddUrls}
        helperText="Upload multiple product photos (auto-resized up to 1600px, max 2 MB) or paste external URLs."
      />

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
              <div className="aspect-square rounded-lg overflow-hidden bg-[var(--bg-alt)] flex items-center justify-center">
                <img
                  src={img.image_url}
                  alt={`Product ${idx + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <ImageOff className="w-5 h-5 text-[var(--ink-soft)] hidden" />
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
