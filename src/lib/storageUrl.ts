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
