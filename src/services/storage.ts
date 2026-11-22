import { parseManagedStorageUrl, type StorageBucket } from '../lib/storageUrl';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const MAX_WIDTH = 1600;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB safety limit before canvas decode

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export interface UploadStorageOptions {
  fileNameHint?: string;
  onProgress?: (percent: number, stage: string) => void;
}

function formatUploadError(err: unknown): Error {
  const raw =
    err instanceof Error
      ? err.message
      : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : '';
  const lower = raw.toLowerCase();

  if (
    lower.includes('row-level security') ||
    lower.includes('unauthorized') ||
    lower.includes('not allowed') ||
    lower.includes('permission') ||
    lower.includes('403') ||
    lower.includes('401')
  ) {
    return new Error(
      'Upload failed: please sign in with an admin account (profiles.role = admin).',
    );
  }
  if (lower.includes('payload too large') || lower.includes('2 mb') || lower.includes('size')) {
    return new Error('Image exceeds the 2 MB upload limit.');
  }
  if (raw.trim()) {
    return new Error(raw);
  }
  return new Error('Image upload failed. Please try again.');
}

async function resizeImageFile(file: File): Promise<Blob> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      'Unsupported file type. Please choose a JPG, PNG, WebP, GIF, or SVG image.',
    );
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Selected file is too large (max 25 MB before resizing).');
  }

  if (file.type === 'image/svg+xml') {
    if (file.size > MAX_BYTES) {
      throw new Error('SVG file exceeds the 2 MB limit.');
    }
    return file;
  }

  const imageBitmap = await createImageBitmap(file);
  try {
    const scale =
      imageBitmap.width > MAX_WIDTH ? MAX_WIDTH / imageBitmap.width : 1;
    const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not initialize image canvas.');
    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const webp = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85),
    );
    if (webp && webp.size <= MAX_BYTES) {
      return webp;
    }

    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.75),
    );
    if (!jpeg) {
      throw new Error('Image compression failed.');
    }
    if (jpeg.size > MAX_BYTES) {
      throw new Error('Resized image still exceeds the 2 MB limit.');
    }
    return jpeg;
  } finally {
    imageBitmap.close();
  }
}

export async function uploadStorageImage(
  bucket: StorageBucket,
  pathPrefix: string,
  file: File,
  options: UploadStorageOptions = {},
): Promise<string> {
  const { fileNameHint, onProgress } = options;

  onProgress?.(20, 'Resizing image...');
  const resized = await resizeImageFile(file);

  if (!isSupabaseConfigured || !supabase) {
    onProgress?.(85, 'Preparing preview...');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read local file.'));
      reader.readAsDataURL(resized);
    });
    onProgress?.(100, 'Complete');
    return dataUrl;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in as an admin to upload images.');
  }

  onProgress?.(55, 'Uploading to Supabase Storage...');

  const baseName = (fileNameHint || file.name)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .slice(0, 60) || 'image';
  const ext =
    resized.type === 'image/svg+xml'
      ? 'svg'
      : resized.type === 'image/webp'
        ? 'webp'
        : 'jpg';
  const cleanPrefix = pathPrefix.replace(/^\/+|\/+$/g, '');
  const objectPath = `${cleanPrefix}/${Date.now()}-${baseName}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, resized, {
      contentType: resized.type,
      upsert: false,
    });
  if (error) {
    throw formatUploadError(error);
  }

  onProgress?.(100, 'Uploaded');
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Deletes an uploaded object from Supabase Storage ONLY if the URL belongs to
 * our managed `product-images` or `site-assets` bucket. Pasted external URLs are ignored.
 */
export async function deleteStorageImageByPublicUrl(url: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !url) return;

  const supabaseUrl = (
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
  ).trim();
  const parsed = parseManagedStorageUrl(url, supabaseUrl || undefined);
  if (!parsed) return;

  const { error } = await supabase.storage
    .from(parsed.bucket)
    .remove([parsed.path]);
  if (error) {
    console.warn('Could not delete storage file:', error.message);
  }
}
