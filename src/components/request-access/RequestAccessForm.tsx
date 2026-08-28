import { useState, useId, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { EarlyAccessFormData, FormFieldErrors } from '../../types/earlyAccess';
import { ROLE_OPTIONS } from '../../types/earlyAccess';
import {
  hasValidationErrors,
  normalizeFormData,
  validateEarlyAccessForm,
} from '../../lib/validation';
import { isSupabaseConfigured, submitEarlyAccessUser } from '../../lib/supabase';

const inputBase =
  'w-full bg-surface-container-low border px-4 py-3 font-body-md text-[14px] text-primary tracking-wide focus:outline-none transition-colors duration-300 placeholder:text-surface-variant/50 rounded-sm';

interface RequestAccessFormProps {
  onSuccess: () => void;
}

export default function RequestAccessForm({ onSuccess }: RequestAccessFormProps) {
  const formId = useId();
  const [form, setForm] = useState<EarlyAccessFormData>({
    fullName: '',
    email: '',
    company: '',
    role: '',
  });
  const [errors, setErrors] = useState<FormFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = <K extends keyof EarlyAccessFormData>(key: K, value: EarlyAccessFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const handleBlur = (field: keyof EarlyAccessFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateEarlyAccessForm(form);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, company: true, role: true });

    const validationErrors = validateEarlyAccessForm(form);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrors({
        form: 'Early access is not configured yet. Please add Supabase environment variables.',
      });
      return;
    }

    setLoading(true);
    setErrors({});

    const payload = normalizeFormData(form);
    const { error } = await submitEarlyAccessUser(payload);

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ email: error.message });
      } else {
        setErrors({ form: error.message });
      }
      return;
    }

    onSuccess();
  };

  const fieldError = (field: keyof FormFieldErrors) =>
    touched[field] ? errors[field] : undefined;

  return (
    <motion.form
      key="access-form"
      id={formId}
      onSubmit={handleSubmit}
      className="space-y-5 mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      noValidate
    >
      {errors.form && (
        <div
          role="alert"
          className="rounded-sm border border-error/40 bg-error-container/20 px-3 py-2 font-label-sm text-label-sm text-error"
        >
          {errors.form}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-fullName`} className="font-label-sm text-label-sm text-on-surface-variant">
          Full Name <span className="text-purple-400">*</span>
        </label>
        <input
          id={`${formId}-fullName`}
          name="fullName"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(fieldError('fullName'))}
          aria-describedby={fieldError('fullName') ? `${formId}-fullName-error` : undefined}
          value={form.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          placeholder="Jane Creator"
          className={`${inputBase} ${fieldError('fullName') ? 'border-error/60 focus:border-error' : 'border-outline-variant focus:border-purple-500'}`}
        />
        {fieldError('fullName') && (
          <p id={`${formId}-fullName-error`} className="text-[12px] text-error" role="alert">
            {fieldError('fullName')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-email`} className="font-label-sm text-label-sm text-on-surface-variant">
          Email Address <span className="text-purple-400">*</span>
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldError('email'))}
          aria-describedby={fieldError('email') ? `${formId}-email-error` : undefined}
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="you@company.com"
          className={`${inputBase} ${fieldError('email') ? 'border-error/60 focus:border-error' : 'border-outline-variant focus:border-purple-500'}`}
        />
        {fieldError('email') && (
          <p id={`${formId}-email-error`} className="text-[12px] text-error" role="alert">
            {fieldError('email')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-company`} className="font-label-sm text-label-sm text-on-surface-variant">
          Company / Brand Name <span className="text-surface-variant/50">(optional)</span>
        </label>
        <input
          id={`${formId}-company`}
          name="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={(e) => updateField('company', e.target.value)}
          onBlur={() => handleBlur('company')}
          placeholder="Your studio or brand"
          className={`${inputBase} ${fieldError('company') ? 'border-error/60' : 'border-outline-variant focus:border-purple-500'}`}
        />
        {fieldError('company') && (
          <p className="text-[12px] text-error" role="alert">
            {fieldError('company')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-role`} className="font-label-sm text-label-sm text-on-surface-variant">
          Role <span className="text-surface-variant/50">(optional)</span>
        </label>
        <select
          id={`${formId}-role`}
          name="role"
          value={form.role}
          onChange={(e) => updateField('role', e.target.value as EarlyAccessFormData['role'])}
          className={`${inputBase} cursor-pointer appearance-none border-outline-variant focus:border-purple-500`}
        >
          <option value="">Select your role</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full group relative py-3.5 bg-primary text-surface font-label-md text-label-md uppercase tracking-widest overflow-hidden border border-primary disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
        whileHover={loading ? undefined : { scale: 1.02 }}
        whileTap={loading ? undefined : { scale: 0.98 }}
        aria-busy={loading}
      >
        <span className="relative z-10 flex items-center justify-center gap-2.5 transition-colors duration-300 group-hover:text-primary group-disabled:group-hover:text-surface">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            'Request Access'
          )}
        </span>
        <span className="absolute inset-0 bg-surface transform scale-x-0 group-hover:scale-x-100 group-disabled:group-hover:scale-x-0 transition-transform origin-left duration-300" />
      </motion.button>
    </motion.form>
  );
}
