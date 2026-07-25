'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const dotColor: Record<'green' | 'yellow' | 'purple' | 'red', string> = {
  green: 'bg-brand-success',
  yellow: 'bg-brand-yellow',
  purple: 'bg-brand-purpleLight',
  red: 'bg-brand-danger',
};

export function PulsingBadge({
  children,
  color = 'green',
  className,
}: {
  children: ReactNode;
  color?: 'green' | 'yellow' | 'purple' | 'red';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-text-secondary',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          className={cn('absolute inline-flex h-full w-full rounded-full', dotColor[color])}
          animate={{ scale: [1, 2.6], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', dotColor[color])} />
      </span>
      {children}
    </span>
  );
}
