import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthForm from '../components/auth/AuthForm';
import {
  getPostAuthRedirectWithSession,
  getProfile,
  isSupabaseConfigured,
  signUp,
} from '../lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError('Auth is not configured. Add Supabase keys to your .env file.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
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

      const profile = await getProfile(userId);
      window.location.href = getPostAuthRedirectWithSession(profile, data.session ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setLoading(false);
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
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
