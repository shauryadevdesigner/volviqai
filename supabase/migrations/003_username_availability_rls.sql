-- Drop unused RPC
DROP FUNCTION IF EXISTS public.is_username_available(text);

-- Remove prior availability policy if this migration is re-run
DROP POLICY IF EXISTS "Authenticated can read usernames for availability" ON public.profiles;
DROP POLICY IF EXISTS "username_availability_check" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow username existence checks via .from('profiles').select('username').eq(...)
CREATE POLICY "username_availability_check"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);
