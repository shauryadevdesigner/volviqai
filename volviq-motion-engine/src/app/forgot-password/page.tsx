"use client";

import { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { getSupabase, APP_URL } from '@/lib/supabase';
import { motion } from 'motion/react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = getSupabase();
      const redirectTo = `${APP_URL}/otp`; // Redirect user to otp/password reset confirmation page
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      protocolLabel="09 // SECURITY PORTAL"
      headline="RESET PASSWORD"
      subheadline="Enter your email to receive a password reset link."
      footerLink={{ prompt: 'Remembered your password?', to: '/login', label: 'Sign in' }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary"
            placeholder="you@company.com"
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
                Please wait…
              </>
            ) : (
              'Send reset link'
            )}
          </span>
          <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100 group-disabled:group-hover:scale-x-0" />
        </button>
      </form>
    </AuthLayout>
  );
}
