import { supabase } from './supabase';

/**
 * Upload / delete helper for question illustrations (diagrams, code, tables).
 * Images live in the public `question-images` Storage bucket. Reads are public;
 * writes are admin-only (enforced by Storage RLS using public.is_admin()).
 */

const BUCKET = 'question-images';

// Keep uploads small so tests load fast on mobile data. Heavier files should be
// compressed by the admin before upload (we reject rather than silently resize).
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

export interface UploadResult {
  url: string;
  path: string;
}

function extFor(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (fromName) return fromName;
  const fromType = file.type.split('/')[1];
  return fromType || 'png';
}

/** Validates and uploads an image, returning its public URL. Throws on error. */
export async function uploadQuestionImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Faqat rasm (PNG, JPG, WEBP, GIF, SVG) yuklash mumkin.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Rasm hajmi 2 MB dan oshmasligi kerak. Iltimos siqib qayta yuklang.");
  }

  const path = `q-${crypto.randomUUID()}.${extFor(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(`Yuklashda xato: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Best-effort delete of a previously uploaded image by its public URL. Non-fatal. */
export async function deleteQuestionImage(url: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
