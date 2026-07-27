'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionBlock({
  children,
  background = 'transparent',
  className,
  accentColor,
}: {
  children: ReactNode;
  background?: 'transparent' | 'card' | 'highlighted';
  className?: string;
  accentColor?: string;
}) {
  const color = accentColor ?? '#7C3AED';

  return (
    <motion.section
      className={cn(
        'py-8',
        background === 'card' && 'rounded-2xl border border-border bg-bg-card px-6 sm:px-8',
        className
      )}
      style={background === 'highlighted' ? { backgroundColor: `${color}0A`, borderRadius: 24, padding: 28 } : undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}
