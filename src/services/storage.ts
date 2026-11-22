import { isSupabaseConfigured, supabase } from '../lib/supabase';

const MAX_DIMENSION = 1600;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

async function resizeImageFile(file: File): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const scale =
    imageBitmap.width > MAX_DIMENSION ? MAX_DIMENSION / imageBitmap.width : 1;
  const targetWidth = Math.round(imageBitmap.width * scale);
  const targetHeight = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize image canvas');
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
  imageBitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.85),
  );
  if (!blob) throw new Error('Image compression failed');
  if (blob.size > MAX_BYTES) {
    const smaller = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.72),
    );
    if (!smaller || smaller.size > MAX_BYTES) {
      throw new Error('Resized image still exceeds 2 MB limit');
    }
    return smaller;
  }
  return blob;
}

export async function uploadStorageImage(
  bucket: 'product-images' | 'site-assets',
  pathPrefix: string,
  file: File,
): Promise<string> {
  const resized = await resizeImageFile(file);

  if (!isSupabaseConfigured || !supabase) {
    // Convert to data URL in preview/demo mode
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read local file'));
      reader.readAsDataURL(resized);
    });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '');
  const ext = resized.type === 'image/webp' ? 'webp' : 'jpg';
  const objectPath = `${pathPrefix}/${Date.now()}-${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, resized, {
      contentType: resized.type,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}
