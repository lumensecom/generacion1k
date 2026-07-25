'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedDivider({
  className,
  width = 64,
}: {
  className?: string;
  width?: number | string;
}) {
  return (
    <motion.div
      className={cn('h-[3px] rounded-full bg-gradient-to-r from-brand-purple to-brand-pink origin-left', className)}
      style={{ width }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
