import { useEffect, useState } from 'react';
import { getThumbnailPublicUrl } from '../../lib/storageUrl';
import { CategoryIcon } from '../ui/CategoryIcon';

interface ProductImageSlotProps {
  imageUrl?: string | null;
  alt: string;
  sku?: string;
  categoryIcon?: string | null;
  className?: string;
  useThumb?: boolean;
  width?: number;
  height?: number;
}

export function ProductImageSlot({
  imageUrl,
  alt,
  sku,
  categoryIcon,
  className = '',
  useThumb = false,
  width = 480,
  height = 480,
}: ProductImageSlotProps) {
  const [triedFull, setTriedFull] = useState(false);
  const [failed, setFailed] = useState(false);

  const supabaseUrl = (
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
  ).trim();
  const thumbUrl =
    useThumb && imageUrl
      ? getThumbnailPublicUrl(imageUrl, supabaseUrl || undefined)
      : imageUrl;
  const activeSrc =
    useThumb && !triedFull && thumbUrl ? thumbUrl : (imageUrl ?? null);

  useEffect(() => {
    setTriedFull(false);
    setFailed(false);
  }, [imageUrl, useThumb]);

  if (activeSrc && !failed) {
    return (
      <img
        src={activeSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (useThumb && !triedFull && thumbUrl && thumbUrl !== imageUrl) {
            setTriedFull(true);
          } else {
            setFailed(true);
          }
        }}
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
