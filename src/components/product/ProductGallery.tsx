import { useEffect, useState } from 'react';
import type { ProductImage } from '../../types/db';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ProductImageSlot } from './ProductImageSlot';

interface ProductGalleryProps {
  images: ProductImage[];
  alt: string;
  sku: string;
  categoryIcon?: string | null;
}

export function ProductGallery({
  images,
  alt,
  sku,
  categoryIcon,
}: ProductGalleryProps) {
  const ordered = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedIdx(0);
    setFailedThumbs({});
  }, [images]);

  const currentUrl = ordered[selectedIdx]?.image_url ?? null;

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] overflow-hidden">
        <ProductImageSlot
          imageUrl={currentUrl}
          alt={alt}
          sku={sku}
          categoryIcon={categoryIcon}
          width={800}
          height={800}
        />
      </div>

      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {ordered.map((img, idx) => {
            const thumbFailed = Boolean(failedThumbs[img.id]);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all bg-[var(--bg-alt)] flex items-center justify-center ${
                  selectedIdx === idx
                    ? 'border-[var(--brand-red)] ring-2 ring-[var(--brand-red)]/20'
                    : 'border-[var(--line)] hover:border-gray-400'
                }`}
              >
                {thumbFailed ? (
                  <CategoryIcon
                    name={categoryIcon}
                    className="w-5 h-5 text-[var(--ink-soft)]"
                  />
                ) : (
                  <img
                    src={img.image_url}
                    alt={`${alt} thumbnail ${idx + 1}`}
                    width={160}
                    height={160}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedThumbs((prev) => ({ ...prev, [img.id]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
