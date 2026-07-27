'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function ExampleCard({
  company = 'LUMENS',
  children,
  accentColor,
}: {
  company?: string;
  children: ReactNode;
  accentColor?: string;
}) {
  const color = accentColor ?? '#F59E0B';

  return (
    <motion.div
      className="rounded-2xl border p-6"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}0D` }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5 }}
    >
      <span
        className="mb-4 inline-block rounded-full px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-black"
        style={{ backgroundColor: color }}
      >
        Ejemplo real · {company}
      </span>
      <div className="text-[15px] leading-relaxed text-text-secondary">{children}</div>
    </motion.div>
  );
}
