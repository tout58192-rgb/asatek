import { useState } from 'react';
import type { ProductImage } from '../../types/db';
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
  const currentUrl = ordered[selectedIdx]?.image_url ?? null;

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full rounded-xl border border-[var(--line)] bg-[var(--bg-alt)] overflow-hidden">
        <ProductImageSlot
          imageUrl={currentUrl}
          alt={alt}
          sku={sku}
          categoryIcon={categoryIcon}
        />
      </div>

      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {ordered.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all ${
                selectedIdx === idx
                  ? 'border-[var(--brand-red)] ring-2 ring-[var(--brand-red)]/20'
                  : 'border-[var(--line)] hover:border-gray-400'
              }`}
            >
              <img
                src={img.image_url}
                alt={`${alt} thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
