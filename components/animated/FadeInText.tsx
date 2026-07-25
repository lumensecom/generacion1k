'use client';

import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

export function FadeInText({
  children,
  as: Tag = 'div',
  delay = 0,
  duration = 0.6,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const MotionTag = motion(Tag as ElementType);
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </MotionTag>
  );
}
