// ==============================================================================
// R.ON DRAMA STUDIO — SUPABASE CLIENT & STORAGE ADAPTER
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an asset image. If Supabase is configured, uploads to Supabase Storage;
 * otherwise, returns a local object URL or Data URL for local persistence.
 */
export async function uploadAssetImage(
  bucket: 'characters' | 'locations' | 'props' | 'costumes' | 'project-assets' | 'shot-references',
  file: File,
  path: string
): Promise<{ url: string; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) {
        return { url: '', error: error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { url: '', error: msg };
    }
  }

  // Local fallback: convert file to Base64 Data URL for persistent local storage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: '', error: 'Failed to read local file.' });
    };
    reader.readAsDataURL(file);
  });
}
