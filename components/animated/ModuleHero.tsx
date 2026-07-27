'use client';

import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/animated/TypewriterText';
import { FloatingOrb } from '@/components/animated/FloatingOrb';

export function ModuleHero({
  title,
  introLine1,
  introLine2,
  moduleIndex,
  totalModules,
  progressPercent,
  accentColor,
}: {
  title: string;
  introLine1: string;
  introLine2?: string;
  moduleIndex: number;
  totalModules: number;
  progressPercent: number;
  accentColor: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-bg-card px-6 py-10 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 -top-16 h-64 w-64 rounded-full blur-[80px]"
          style={{ backgroundColor: `${accentColor}33` }}
        />
        <FloatingOrb color="pink" size={220} style={{ bottom: '-10%', right: '-4%', opacity: 0.4 }} delay={2} />
      </div>

      <div className="relative z-10">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white"
          style={{ borderColor: `${accentColor}55`, backgroundColor: `${accentColor}1A` }}
        >
          Módulo {moduleIndex} de {totalModules}
        </motion.span>

        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>

        <div className="mt-4 min-h-[28px] text-lg text-text-secondary sm:text-xl">
          <TypewriterText text={introLine1} speed={22} />
        </div>
        {introLine2 && (
          <motion.p
            className="mt-1 text-lg text-text-secondary sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: introLine1.length * 0.022 + 0.5, duration: 0.6 }}
          >
            {introLine2}
          </motion.p>
        )}

        <div className="mt-8 max-w-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
            <span>Progreso del módulo</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
