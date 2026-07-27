'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedParagraph({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.p
      className={cn('text-[15px] leading-relaxed text-text-secondary', className)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.p>
  );
}
