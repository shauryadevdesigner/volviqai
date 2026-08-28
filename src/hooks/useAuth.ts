import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getPostAuthRedirect,
  getProfile,
  getSession,
  isSupabaseConfigured,
  onAuthStateChange,
} from '../lib/supabase';
import type { UserProfile } from '../types/profile';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    getSession().then(async (s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        await refreshProfile(s.user.id);
      }
      setLoading(false);
    });

    const sub = onAuthStateChange(async (s) => {
      setSession(s);
      if (s?.user) {
        await refreshProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, [refreshProfile]);

  const redirectAfterAuth = useCallback(
    (p: UserProfile | null) => {
      window.location.href = getPostAuthRedirect(p);
    },
    [],
  );

  return {
    session,
    profile,
    loading,
    isAuthenticated: Boolean(session),
    refreshProfile,
    redirectAfterAuth,
  };
}
