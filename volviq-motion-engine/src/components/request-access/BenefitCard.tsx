import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  icon: LucideIcon;
  label: string;
  index: number;
}

export default function BenefitCard({ icon: Icon, label, index }: BenefitCardProps) {
  return (
    <motion.li
      className="group flex items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-low/60 px-4 py-3 backdrop-blur-sm transition-colors duration-300 hover:border-purple-500/40 hover:bg-purple-500/5"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-purple-500/25 bg-purple-500/10 text-purple-400 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="font-label-sm text-label-sm text-on-surface tracking-wide">{label}</span>
    </motion.li>
  );
}
