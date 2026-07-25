'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Progress({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-white/8', className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-brand-yellowHover"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
