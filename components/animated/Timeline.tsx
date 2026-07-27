'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface TimelineStep {
  title: string;
  description?: ReactNode;
  meta?: string;
}

export function Timeline({ steps, accentColor }: { steps: TimelineStep[]; accentColor?: string }) {
  const color = accentColor ?? '#7C3AED';

  return (
    <div className="relative pl-8">
      <motion.div
        className="absolute left-[11px] top-2 w-0.5 origin-top"
        style={{ backgroundColor: `${color}40`, bottom: 8 }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="space-y-7">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="relative"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
          >
            <span
              className="absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <h4 className="font-display text-sm font-extrabold text-white">{step.title}</h4>
              {step.meta && <span className="font-mono text-[11px] text-text-muted">({step.meta})</span>}
            </div>
            {step.description && <div className="mt-1 text-sm text-text-secondary">{step.description}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
