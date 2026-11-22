import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string | null;
  role: 'admin';
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: 'admin',
  };
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<AdminUser> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    throw new Error(error?.message || 'Invalid email or password');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(profileError.message || 'Failed to verify admin profile');
  }

  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Not authorised');
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role: 'admin',
  };
}

export async function signOutAdmin(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }
  await supabase.auth.signOut();
}
