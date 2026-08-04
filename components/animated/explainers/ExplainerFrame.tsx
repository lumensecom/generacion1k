'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ExplainerStepMeta {
  label: string;
}

export function ExplainerFrame({
  chromeLabel,
  accentColor,
  steps,
  stepDurationMs = 3200,
  children,
}: {
  chromeLabel: string;
  accentColor: string;
  steps: ExplainerStepMeta[];
  stepDurationMs?: number;
  children: (activeStep: number) => ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), stepDurationMs);
    return () => clearInterval(t);
  }, [playing, steps.length, stepDurationMs]);

  return (
    <div
      className="not-prose overflow-hidden rounded-2xl border"
      style={{ borderColor: `${accentColor}33` }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: `${accentColor}22`, backgroundColor: `${accentColor}0A` }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex flex-shrink-0 gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </span>
          <span className="truncate font-mono text-[11px] text-text-muted">{chromeLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted transition hover:text-white"
          style={{ backgroundColor: `${accentColor}14` }}
          aria-label={playing ? 'Pausar animación' : 'Reproducir animación'}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? 'Pausar' : 'Reproducir'}
        </button>
      </div>

      <div className="relative min-h-[260px] overflow-hidden bg-bg-card px-5 py-7 sm:px-8 sm:py-9">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.12] blur-3xl"
          style={{ backgroundColor: accentColor }}
        />
        <div className="relative">{children(active)}</div>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 border-t px-4 py-3"
        style={{ borderColor: `${accentColor}22` }}
      >
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActive(i);
                setPlaying(false);
              }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 22 : 7,
                backgroundColor: i === active ? accentColor : `${accentColor}30`,
              }}
              aria-label={s.label}
            />
          ))}
        </div>
        <motion.span
          key={steps[active]?.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="font-mono text-[11px] text-text-secondary"
        >
          {steps[active]?.label}
        </motion.span>
      </div>
    </div>
  );
}
