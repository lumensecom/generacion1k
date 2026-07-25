'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function RevealCard({
  children,
  delay = 0,
  className,
  hover = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-border bg-bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_14px_34px_rgba(0,0,0,0.3)]',
        className
      )}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -4, borderColor: 'rgba(124,58,237,0.5)' } : undefined}
    >
      {children}
    </motion.div>
  );
}
