import { motion } from 'motion/react';

interface AuthFormProps {
  email: string;
  password: string;
  confirmPassword?: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange?: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  submitLabel,
  loading,
  error,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={confirmPassword !== undefined ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary"
          placeholder="••••••••"
        />
      </div>

      {confirmPassword !== undefined && onConfirmPasswordChange && (
        <div>
          <label htmlFor="confirm" className="mb-2 block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="w-full border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary outline-none transition-colors focus:border-primary"
            placeholder="••••••••"
          />
        </div>
      )}

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
            submitLabel
          )}
        </span>
        <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100 group-disabled:group-hover:scale-x-0" />
      </button>
    </form>
  );
}
