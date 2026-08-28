"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { getSupabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { motion } from 'motion/react';

export default function OTPPage() {
  const router = useRouter();
  const { session } = useAuthContext();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    // Detect if we arrived here from a password reset link (already logged in via URL hash)
    if (session) {
      setIsRecoveryMode(true);
    }
  }, [session]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup', // can also be 'recovery' or 'magiclink'
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage('Password updated successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      protocolLabel={isRecoveryMode ? "10 // SECURITY PROFILE" : "08 // OTP VERIFICATION"}
      headline={isRecoveryMode ? "SET NEW PASSWORD" : "OTP VERIFICATION"}
      subheadline={
        isRecoveryMode
          ? "Update your credentials for secure authentication."
          : "Verify your email with the 6-digit confirmation code."
      }
      footerLink={{ prompt: 'Need access?', to: '/signup', label: 'Create account' }}
    >
      {isRecoveryMode ? (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-error/40 bg-error-container/20 px-3 py-2 font-body-md text-body-md text-error"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-primary/40 bg-primary-container/20 px-3 py-2 font-body-md text-body-md text-primary"
              role="alert"
            >
              {message}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden bg-primary py-4 font-label-md text-label-md uppercase tracking-widest text-surface transition-all disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors group-hover:text-primary group-disabled:group-hover:text-surface">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent group-hover:border-primary group-hover:border-t-transparent" />
                  Updating…
                </>
              ) : (
                'Save Password'
              )}
            </span>
            <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100 group-disabled:group-hover:scale-x-0" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary mb-3"
              placeholder="you@company.com"
            />
            
            <label htmlFor="code" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              OTP Code
            </label>
            <input
              id="code"
              type="text"
              required
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary text-center tracking-[0.5em] font-mono text-lg"
              placeholder="000000"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-error/40 bg-error-container/20 px-3 py-2 font-body-md text-body-md text-error"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-primary/40 bg-primary-container/20 px-3 py-2 font-body-md text-body-md text-primary"
              role="alert"
            >
              {message}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || token.length < 6}
            className="group relative w-full overflow-hidden bg-primary py-4 font-label-md text-label-md uppercase tracking-widest text-surface transition-all disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors group-hover:text-primary group-disabled:group-hover:text-surface">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent group-hover:border-primary group-hover:border-t-transparent" />
                  Verifying…
                </>
              ) : (
                'Verify code'
              )}
            </span>
            <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100 group-disabled:group-hover:scale-x-0" />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
