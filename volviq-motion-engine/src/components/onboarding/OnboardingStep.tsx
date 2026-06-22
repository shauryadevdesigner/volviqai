import { motion } from 'motion/react';

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function OnboardingStep({ title, subtitle, children }: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}
