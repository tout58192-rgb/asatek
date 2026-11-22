import { useState } from 'react';
import { CategoryIcon } from '../ui/CategoryIcon';

interface ProductImageSlotProps {
  imageUrl?: string | null;
  alt: string;
  sku?: string;
  categoryIcon?: string | null;
  className?: string;
}

export function ProductImageSlot({
  imageUrl,
  alt,
  sku,
  categoryIcon,
  className = '',
}: ProductImageSlotProps) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full bg-[var(--bg-alt)] flex flex-col items-center justify-center gap-2 p-4 text-center select-none ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-[var(--line)] text-[var(--brand-red)]">
        <CategoryIcon name={categoryIcon} className="w-7 h-7" />
      </div>
      {sku && (
        <span className="font-mono-num text-xs font-medium text-[var(--ink-soft)] tracking-tight">
          {sku}
        </span>
      )}
    </div>
  );
}
