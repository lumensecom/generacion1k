'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colorMap: Record<'purple' | 'pink' | 'amber' | 'cyan', string> = {
  purple: 'bg-brand-purple/28',
  pink: 'bg-brand-pink/18',
  amber: 'bg-brand-yellow/14',
  cyan: 'bg-brand-cyan/14',
};

export function FloatingOrb({
  color = 'purple',
  size = 400,
  className,
  style,
  duration = 16,
  delay = 0,
}: {
  color?: 'purple' | 'pink' | 'amber' | 'cyan';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full blur-[90px]', colorMap[color], className)}
      style={{ width: size, height: size, ...style }}
      animate={{
        x: [0, 40, -25, 0],
        y: [0, -30, 25, 0],
        scale: [1, 1.15, 0.95, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
