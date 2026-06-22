import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../providers/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.push('/login');
      return;
    }
    if (!loading && !session) {
      router.push('/login');
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return children;
}
