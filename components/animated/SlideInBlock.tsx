'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function SlideInBlock({
  children,
  delay = 0,
  distance = 28,
  duration = 0.7,
  className,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
