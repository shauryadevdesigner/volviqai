import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthForm from '../components/auth/AuthForm';
import {
  getPostAuthRedirectWithSession,
  getProfile,
  isSupabaseConfigured,
  signIn,
} from '../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError('Auth is not configured. Add Supabase keys to your .env file.');
      return;
    }

    setLoading(true);
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

      const profile = await getProfile(userId);
      window.location.href = getPostAuthRedirectWithSession(profile, data.session ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
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
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
