'use client';

import { motion } from 'framer-motion';
import { X, Check, Circle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ComparisonColumn {
  label: string;
  tone: 'bad' | 'good' | 'neutral';
  items: ReactNode[];
}

const toneMeta = {
  bad: { icon: X, border: 'border-brand-danger/30', bg: 'bg-brand-danger/5', iconColor: 'text-brand-danger' },
  good: { icon: Check, border: 'border-brand-success/30', bg: 'bg-brand-success/5', iconColor: 'text-brand-success' },
  neutral: { icon: Circle, border: 'border-border', bg: 'bg-white/2', iconColor: 'text-brand-purpleLight' },
};

export function ComparisonBlock({ columns, className }: { columns: ComparisonColumn[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        columns.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        className
      )}
    >
      {columns.map((col, ci) => {
        const meta = toneMeta[col.tone];
        const Icon = meta.icon;
        const fromLeft = ci % 2 === 0;
        return (
          <motion.div
            key={col.label}
            className={cn('rounded-2xl border p-5', meta.border, meta.bg)}
            initial={{ opacity: 0, x: fromLeft ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: ci * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className={cn('mb-3 text-sm font-bold', meta.iconColor)}>{col.label}</p>
            <ul className="space-y-2.5">
              {col.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', meta.iconColor)} />
                  <span className="leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}
