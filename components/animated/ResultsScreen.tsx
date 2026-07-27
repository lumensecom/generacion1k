'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { fireBigConfetti } from '@/lib/confetti';
import { Button } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';

export function ResultsScreen({
  score,
  total,
  passed,
  hasNextModule,
  onContinue,
  onRetry,
  onReviewTheory,
  accentColor,
}: {
  score: number;
  total: number;
  passed: boolean;
  hasNextModule: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onReviewTheory: () => void;
  accentColor?: string;
}) {
  const color = accentColor ?? '#7C3AED';
  const celebrated = useRef(false);

  useEffect(() => {
    if (passed && !celebrated.current) {
      celebrated.current = true;
      fireBigConfetti();
    }
  }, [passed]);

  return (
    <motion.div
      className="flex flex-col items-center py-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 font-mono text-3xl font-medium text-white"
        style={{ borderColor: passed ? '#10B981' : color }}
      >
        <AnimatedNumber value={score} />/{total}
      </div>

      {passed ? (
        <>
          <CheckCircle2 className="mb-3 h-8 w-8 text-brand-success" />
          <h3 className="font-display text-2xl font-extrabold text-white">¡Aprobaste el módulo!</h3>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Respondiste {score} de {total} preguntas correctamente.
          </p>
          <Button type="button" size="lg" className="mt-8" onClick={onContinue}>
            {hasNextModule ? 'Continuar al siguiente módulo' : 'Programa completado'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-display text-2xl font-extrabold text-white">Ya casi.</h3>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Revisa el contenido y vuelve a intentarlo. Necesitas al menos 4 de {total} para avanzar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="ghost" onClick={onReviewTheory}>
              Revisar contenido
            </Button>
            <Button type="button" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" /> Reintentar test
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
