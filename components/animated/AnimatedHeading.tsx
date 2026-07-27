'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const sizeByLevel = {
  1: 'text-3xl sm:text-4xl',
  2: 'text-2xl sm:text-3xl',
  3: 'text-xl sm:text-2xl',
} as const;

export function AnimatedHeading({
  level = 2,
  children,
  className,
}: {
  level?: 1 | 2 | 3;
  children: string;
  className?: string;
}) {
  const Tag = (`h${level}` as unknown) as 'h1' | 'h2' | 'h3';
  const words = children.split(' ');

  return (
    <Tag className={cn('font-display font-extrabold tracking-tight', sizeByLevel[level], className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: i * 0.045, ease: 'easeOut' }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}
