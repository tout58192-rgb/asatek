import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
).trim();
const anonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''
).trim();
const publishableKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? ''
).trim();
const key = anonKey || publishableKey;

export const isSupabaseConfigured = Boolean(url.length > 0 && key.length > 0);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
