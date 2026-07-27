'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function RevealCard({
  children,
  delay = 0,
  className,
  hover = true,
  variant = 'dark',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
  variant?: 'dark' | 'light';
}) {
  const light = variant === 'light';

  return (
    <motion.div
      className={cn(
        'rounded-2xl border',
        light
          ? 'border-light-border bg-light-card shadow-[0_10px_26px_rgba(20,20,60,0.06)]'
          : 'border-border bg-bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_14px_34px_rgba(0,0,0,0.3)]',
        className
      )}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        hover
          ? light
            ? { y: -4, borderColor: 'rgba(124,58,237,0.45)', boxShadow: '0 16px 36px rgba(124,58,237,0.12)' }
            : { y: -4, borderColor: 'rgba(124,58,237,0.5)' }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
