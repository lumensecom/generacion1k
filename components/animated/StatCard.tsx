'use client';

import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';
import { cn } from '@/lib/utils';

export function StatCard({
  number,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  accentColor,
  className,
}: {
  number: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  accentColor?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-border bg-bg-card p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="font-mono text-3xl font-medium sm:text-4xl" style={{ color: accentColor ?? '#F59E0B' }}>
        <AnimatedNumber value={number} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <p className="mt-2 text-xs uppercase tracking-widest text-text-muted">{label}</p>
    </motion.div>
  );
}
