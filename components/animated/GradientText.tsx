'use client';

import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GradientText({
  children,
  as: Tag = 'span',
  className,
  animate = true,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  animate?: boolean;
}) {
  const MotionTag = motion(Tag as ElementType);
  return (
    <MotionTag
      className={cn('bg-clip-text text-transparent bg-[length:200%_auto]', className)}
      style={{
        backgroundImage: 'linear-gradient(120deg, #fff 0%, #A855F7 35%, #EC4899 60%, #A855F7 100%)',
      }}
      animate={animate ? { backgroundPosition: ['0% center', '200% center'] } : undefined}
      transition={animate ? { duration: 6, repeat: Infinity, ease: 'linear' } : undefined}
    >
      {children}
    </MotionTag>
  );
}
