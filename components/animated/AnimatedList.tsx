'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function AnimatedList({
  type = 'bulleted',
  items,
  className,
  accentColor,
}: {
  type?: 'numbered' | 'bulleted' | 'checked';
  items: ReactNode[];
  className?: string;
  accentColor?: string;
}) {
  return (
    <motion.ul
      className={cn('space-y-3', className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((content, i) => (
        <motion.li key={i} variants={item} className="flex items-start gap-3 text-[15px] text-text-secondary">
          {type === 'numbered' && (
            <span
              className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
              style={{ backgroundColor: accentColor ?? '#7C3AED' }}
            >
              {i + 1}
            </span>
          )}
          {type === 'checked' && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.15, type: 'spring', stiffness: 300 }}
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accentColor ?? '#10B981'}26` }}
            >
              <Check className="h-3 w-3" style={{ color: accentColor ?? '#10B981' }} />
            </motion.span>
          )}
          {type === 'bulleted' && (
            <span
              className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: accentColor ?? '#A855F7' }}
            />
          )}
          <span className="leading-relaxed">{content}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
