import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export async function getUserFromRequest(
  req: Request,
): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Enforces that a request carries a valid Supabase bearer token.
 * Returns the authenticated user + token on success, or a ready-to-send
 * 401 Response on failure so routes can `return` it directly:
 *
 *   const auth = await requireAuth(req);
 *   if (auth instanceof Response) return auth;
 *   const { user, accessToken } = auth;
 */
export async function requireAuth(
  req: Request,
): Promise<{ user: User; accessToken: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Authentication required.", type: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired session. Please log in again.", type: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  return { user, accessToken };
}

export async function checkAndIncrementUsage(

  userId: string,
  accessToken: string,
): Promise<{ ok: boolean; error?: string; used?: number; limit?: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { ok: true };

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("increment_generation_usage", {
    user_id: userId,
  });

  if (error) {
    if (error.code !== "PGRST202") {
      console.warn("Usage tracking unavailable:", error.message);
    }
    return { ok: true };
  }

  const result = data as {
    ok: boolean;
    error?: string;
    used?: number;
    limit?: number;
  };
  return result;
}
