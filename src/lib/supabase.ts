import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { EarlyAccessUserRow } from '../types/earlyAccess';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
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
