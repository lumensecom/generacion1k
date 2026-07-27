'use client';

import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const meta = {
  tip: { icon: Lightbulb, cls: 'border-brand-yellow/35 bg-brand-yellow/8 text-brand-yellow' },
  warning: { icon: AlertTriangle, cls: 'border-brand-danger/35 bg-brand-danger/8 text-brand-danger' },
  success: { icon: CheckCircle2, cls: 'border-brand-success/35 bg-brand-success/8 text-brand-success' },
  info: { icon: Info, cls: 'border-brand-purple/35 bg-brand-purple/8 text-brand-purpleLight' },
};

export function InfoCallout({
  type = 'info',
  children,
  className,
}: {
  type?: 'tip' | 'warning' | 'success' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, cls } = meta[type];
  return (
    <motion.div
      className={cn('flex items-start gap-3 rounded-2xl border p-5', cls, className)}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4 }}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium leading-relaxed">{children}</p>
    </motion.div>
  );
}
