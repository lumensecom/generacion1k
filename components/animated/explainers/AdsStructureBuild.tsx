'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Film, Gauge, Lock } from 'lucide-react';

const CAPTIONS = [
  'La campaña se crea con un solo objetivo: Website Conversion → Purchase. Nada de Tráfico ni Alcance.',
  'Un solo ad group, targeting automático (Broad), Colombia, 18–55 años — el algoritmo aprende mejor con audiencia abierta.',
  '3 a 5 creativos del mismo ángulo suben juntos, para que el algoritmo elija cuál funciona mejor.',
  'Presupuesto ABO: $50.000 COP/día. Ni más (quema plata sin aprender) ni menos (no alcanza a aprender).',
  'Se lanza y no se toca por 72 horas — pase lo que pase en el panel.',
];

export function AdsStructureBuild({ activeStep, accentColor }: { activeStep: number; accentColor: string }) {
  const hasAdGroup = activeStep >= 1;
  const hasCreatives = activeStep >= 2;
  const hasBudget = activeStep >= 3;
  const isLive = activeStep >= 4;

  return (
    <div>
      <div className="flex flex-col items-center">
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
          style={{ borderColor: accentColor, backgroundColor: `${accentColor}18` }}
        >
          <Target className="h-4 w-4" style={{ color: accentColor }} />
          <span className="font-mono text-[11.5px] font-bold text-white">Campaña · Purchase</span>
        </div>

        <AnimatePresence>
          {hasAdGroup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 20 }}
              className="w-px"
              style={{ backgroundColor: `${accentColor}40` }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasAdGroup && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-secondary px-3.5 py-2"
            >
              <Users className="h-3.5 w-3.5 text-text-secondary" />
              <span className="font-mono text-[11px] text-text-secondary">Ad Group · Broad Colombia · 18–55</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasCreatives && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 20 }}
              className="w-px"
              style={{ backgroundColor: `${accentColor}40` }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasCreatives && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5">
              {[0, 1, 2, 3].map((j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: j * 0.08 }}
                  className="flex h-11 w-8 items-center justify-center rounded-md border"
                  style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}12` }}
                >
                  <Film className="h-3 w-3" style={{ color: accentColor }} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasBudget && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center gap-3">
            <Gauge className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
                initial={{ width: 0 }}
                animate={{ width: '38%' }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="flex-shrink-0 font-mono text-[11px] font-bold text-white">$50.000/día</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/8 px-3 py-2"
          >
            <Lock className="h-3.5 w-3.5 text-brand-danger" />
            <span className="font-mono text-[11px] font-bold text-brand-danger">72 horas sin tocar nada</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mt-5 text-[13.5px] leading-relaxed text-text-secondary"
        >
          {CAPTIONS[activeStep]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
