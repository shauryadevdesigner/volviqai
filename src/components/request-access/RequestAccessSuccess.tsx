import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function RequestAccessSuccess() {
  return (
    <motion.div
      key="success-card"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 py-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10"
      >
        <CheckCircle2 className="h-9 w-9 text-green-400" strokeWidth={1.75} aria-hidden="true" />
      </motion.div>

      <div className="space-y-3">
        <h3 className="font-headline-lg text-[22px] text-primary tracking-tight sm:text-[26px]">
          You&apos;re In! 🎉
        </h3>
        <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant sm:text-[15px]">
          You&apos;ve successfully joined Volviq Early Access. We&apos;ll notify you as soon as your
          access is ready.
        </p>
        <p className="font-label-sm text-label-sm text-surface-variant/80">
          Thank you for becoming one of our early users.
        </p>
      </div>

      <div className="font-code-md text-[9px] uppercase tracking-widest text-green-400/70 border border-green-500/20 bg-green-500/5 px-3 py-2">
        STATUS: EARLY_ACCESS // QUEUED
      </div>
    </motion.div>
  );
}
