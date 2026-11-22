export type StorageBucket = 'product-images' | 'site-assets';

export interface ParsedStorageObject {
  bucket: StorageBucket;
  path: string;
}

const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/';

/**
 * Extracts { bucket, path } if the URL points to one of our managed Supabase Storage buckets
 * (`product-images` or `site-assets`). Returns null for pasted external URLs.
 */
export function parseManagedStorageUrl(
  url: string,
  supabaseUrl?: string,
): ParsedStorageObject | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (supabaseUrl) {
      const expectedHost = new URL(supabaseUrl).host;
      if (parsed.host !== expectedHost) {
        return null;
      }
    }

    const idx = parsed.pathname.indexOf(PUBLIC_OBJECT_MARKER);
    if (idx === -1) return null;

    const rest = parsed.pathname.slice(idx + PUBLIC_OBJECT_MARKER.length);
    const slashIdx = rest.indexOf('/');
    if (slashIdx <= 0) return null;

    const bucket = rest.slice(0, slashIdx);
    const encodedPath = rest.slice(slashIdx + 1);
    if (
      (bucket !== 'product-images' && bucket !== 'site-assets') ||
      !encodedPath
    ) {
      return null;
    }

    return {
      bucket,
      path: decodeURIComponent(encodedPath),
    };
  } catch {
    return null;
  }
}

/**
 * Given a storage object path (e.g. "products/abc/123-img.webp"), returns the
 * thumbnail object path ("products/abc/123-img_thumb.webp"). SVGs keep the same path.
 */
export function getThumbnailStoragePath(objectPath: string): string {
  const dotIdx = objectPath.lastIndexOf('.');
  if (dotIdx <= 0) return `${objectPath}_thumb`;
  const base = objectPath.slice(0, dotIdx);
  const ext = objectPath.slice(dotIdx);
  if (ext.toLowerCase() === '.svg' || base.endsWith('_thumb')) {
    return objectPath;
  }
  return `${base}_thumb${ext}`;
}

/**
 * Converts a managed Supabase Storage public URL into its `_thumb` counterpart
 * for fast card rendering. Pasted external URLs and SVGs are returned untouched.
 */
export function getThumbnailPublicUrl(
  url: string | null | undefined,
  supabaseUrl?: string,
): string | null {
  if (!url) return null;
  const parsed = parseManagedStorageUrl(url, supabaseUrl);
  if (!parsed) return url;

  const thumbPath = getThumbnailStoragePath(parsed.path);
  if (thumbPath === parsed.path) return url;

  try {
    const u = new URL(url);
    const encodedThumb = thumbPath
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    u.pathname = `${PUBLIC_OBJECT_MARKER}${parsed.bucket}/${encodedThumb}`;
    return u.toString();
  } catch {
    return url;
  }
}
