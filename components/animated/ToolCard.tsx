'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export function ToolCard({
  name,
  description,
  url,
  accentColor,
}: {
  name: string;
  description: string;
  url: string;
  accentColor?: string;
}) {
  const color = accentColor ?? '#7C3AED';

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-border bg-bg-card p-6 transition-colors"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -3, borderColor: `${color}80` }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-extrabold text-white"
        style={{ backgroundColor: color }}
      >
        {name.slice(0, 1)}
      </div>
      <h4 className="mb-1 font-display text-base font-extrabold text-white">{name}</h4>
      <p className="mb-4 text-sm text-text-secondary">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
        Abrir {name} <ExternalLink className="h-3.5 w-3.5" />
      </span>
    </motion.a>
  );
}
