"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getProfile,
  getSession,
  isSupabaseConfigured,
  onAuthStateChange,
  setSessionFromTokens,
  signOut,
} from "@/lib/supabase";
import type { UserProfile } from "@/types/profile";

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  accessToken: string | null;
  refreshProfile: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Module-level cache to handle React Strict Mode duplicate mounting in development
let initialSessionPromise: Promise<Session | null> | null = null;
const processedRefreshTokens = new Set<string>();
let activeTokenExchangePromise: Promise<void> | null = null;

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return null;
    }
    const p = await getProfile(session.user.id);
    setProfile(p);
    return p;
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const getInitialSession = (): Promise<Session | null> => {
      if (initialSessionPromise) {
        return initialSessionPromise;
      }

      initialSessionPromise = (async () => {
        const localSession = await getSession();
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Check if we already have a valid session for the same user
          let isSameUser = false;
          if (localSession?.user?.id) {
            const decoded = parseJwt(accessToken);
            if (decoded?.sub === localSession.user.id) {
              isSameUser = true;
            }
          }

          const isLocalSessionValid = localSession && 
            (!localSession.expires_at || localSession.expires_at > Math.floor(Date.now() / 1000) + 60);

          if ((localSession && localSession.access_token === accessToken) || (isSameUser && isLocalSessionValid)) {
            params.delete("access_token");
            params.delete("refresh_token");
            const query = params.toString();
            const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
            window.history.replaceState({}, "", cleanUrl);
            return localSession;
          }

          if (!processedRefreshTokens.has(refreshToken)) {
            processedRefreshTokens.add(refreshToken);
            activeTokenExchangePromise = (async () => {
              try {
                await setSessionFromTokens(accessToken, refreshToken);
              } catch (err) {
                console.error("Token handoff failed:", err);
              } finally {
                params.delete("access_token");
                params.delete("refresh_token");
                const query = params.toString();
                const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
                window.history.replaceState({}, "", cleanUrl);
                activeTokenExchangePromise = null;
              }
            })();
          }

          if (activeTokenExchangePromise) {
            await activeTokenExchangePromise;
          }

          return getSession();
        }

        return localSession;
      })();

      initialSessionPromise.finally(() => {
        initialSessionPromise = null;
      });

      return initialSessionPromise;
    };

    getInitialSession().then(async (s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const p = await getProfile(s.user.id);
        if (mounted) setProfile(p);
      }
      setLoading(false);
    });

    const sub = onAuthStateChange(async (s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const p = await getProfile(s.user.id);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    window.location.href = `https://volviq.xyz/login`;
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      accessToken: session?.access_token ?? null,
      refreshProfile,
      logout,
    }),
    [session, profile, loading, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuthContext();

  useEffect(() => {
    if (auth.loading) return;
    if (!isSupabaseConfigured()) {
      window.location.href = `https://volviq.xyz/login`;
      return;
    }
    if (!auth.session) {
      window.location.href = `https://volviq.xyz/login`;
      return;
    }
    if (auth.profile && !auth.profile.onboarding_completed_at) {
      window.location.href = `https://volviq.xyz/onboarding`;
    }
  }, [auth.loading, auth.session, auth.profile]);

  return auth;
}
