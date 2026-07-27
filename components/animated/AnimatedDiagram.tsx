'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function AnimatedDiagram({ steps, accentColor }: { steps: string[]; accentColor?: string }) {
  const color = accentColor ?? '#7C3AED';

  return (
    <div className="flex flex-col items-stretch gap-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center sm:flex-row">
          <motion.div
            className="rounded-xl border px-4 py-3 text-center text-sm font-semibold text-white"
            style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.18 }}
          >
            {step}
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.18 + 0.15 }}
              className="flex flex-shrink-0 items-center justify-center py-1.5 sm:px-1.5 sm:py-0"
              style={{ color }}
            >
              <ArrowDown className="h-4 w-4 sm:hidden" />
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
