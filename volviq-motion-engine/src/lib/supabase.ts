import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile, OnboardingData } from '../types/profile';
import type { EarlyAccessUserRow } from '../types/earlyAccess';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const MARKETING_APP_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:5173';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export async function submitEarlyAccessUser(payload: {
  full_name: string;
  email: string;
  company: string | null;
  role: string | null;
}): Promise<{ data: EarlyAccessUserRow | null; error: Error | null }> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('early_access_users')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: new Error('This email is already registered for early access.'),
        };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as EarlyAccessUserRow, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    return { data: null, error: new Error(message) };
  }
}

export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function setSessionFromTokens(
  accessToken: string,
  refreshToken: string,
): Promise<Session | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  const supabase = getSupabase();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserProfile | null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<
    Pick<
      UserProfile,
      | 'username'
      | 'display_name'
      | 'goals'
      | 'business_type'
      | 'platform'
      | 'onboarding_completed_at'
      | 'plan'
    >
  >,
): Promise<UserProfile> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Could not save profile.');
  return data as UserProfile;
}

export async function completeOnboarding(
  userId: string,
  onboarding: OnboardingData,
): Promise<UserProfile> {
  return updateProfile(userId, {
    username: onboarding.username.trim().toLowerCase(),
    display_name: onboarding.display_name,
    goals: onboarding.goals,
    business_type: onboarding.business_type,
    platform: onboarding.platform,
    onboarding_completed_at: new Date().toISOString(),
  });
}

export async function signOut() {
  const supabase = getSupabase();
  return supabase.auth.signOut();
}

export async function incrementGenerationUsage(
  userId: string,
): Promise<{ ok: boolean; error?: string; used?: number; limit?: number }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('increment_generation_usage', {
    user_id: userId,
  });

  if (error) throw new Error(error.message);
  const result = data as {
    ok: boolean;
    error?: string;
    used?: number;
    limit?: number;
  };
  return result;
}
