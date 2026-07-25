'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function StaggerList({
  children,
  className,
  itemClassName,
  as: Tag = 'ul',
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  as?: 'ul' | 'ol' | 'div';
}) {
  const MotionTag = motion(Tag as 'ul');
  const MotionItem = motion(Tag === 'div' ? ('div' as const) : ('li' as const));
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children.map((child, i) => (
        <MotionItem key={i} variants={item} className={itemClassName}>
          {child}
        </MotionItem>
      ))}
    </MotionTag>
  );
}
