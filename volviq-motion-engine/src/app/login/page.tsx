"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import {
  getProfile,
  isSupabaseConfigured,
  signIn,
} from '@/lib/supabase';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function SignInPage() {
  const router = useRouter();
  const { session, profile, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && session) {
      if (profile && !profile.onboarding_completed_at) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError('Auth is not configured. Add Supabase keys to your environment variables.');
      return;
    }

    setSubmitLoading(true);
    try {
      const { data, error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError('Sign in failed. Please try again.');
        return;
      }

      const userProfile = await getProfile(userId);
      if (userProfile && !userProfile.onboarding_completed_at) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AuthLayout
      protocolLabel="12 // ACCESS PORTAL"
      headline="WELCOME BACK"
      subheadline="Sign in to your creative workspace."
      footerLink={{ prompt: "Don't have an account?", to: '/signup', label: 'Create account' }}
    >
      <AuthForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        submitLabel="Sign in"
        loading={submitLoading}
        error={error}
      />
    </AuthLayout>
  );
}
