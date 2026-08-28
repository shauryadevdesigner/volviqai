"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import {
  isSupabaseConfigured,
  signUp,
} from '@/lib/supabase';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { session, profile, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitLoading(true);
    try {
      const { data, error: authError } = await signUp(email, password);
      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError('Check your email to confirm your account, then sign in.');
        return;
      }

      // Automatically redirects via useEffect when session updates, 
      // or user needs to verify their email.
      if (!data.session) {
        setError('Verification link sent! Please check your email to activate your account.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AuthLayout
      protocolLabel="11 // CREATE ACCOUNT"
      headline="JOIN VOLVIQ AI"
      subheadline="Create your account and start generating motion graphics."
      footerLink={{ prompt: 'Already have an account?', to: '/login', label: 'Sign in' }}
    >
      <AuthForm
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSubmit={handleSubmit}
        submitLabel="Create account"
        loading={submitLoading}
        error={error}
      />
    </AuthLayout>
  );
}
