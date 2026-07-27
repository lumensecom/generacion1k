'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { TestQuestionDef, TestAnswerValue } from '@/lib/modules-content';

export function TestQuestion({
  def,
  index,
  total,
  answer,
  onAnswer,
  accentColor,
}: {
  def: TestQuestionDef;
  index: number;
  total: number;
  answer: TestAnswerValue;
  onAnswer: (value: TestAnswerValue) => void;
  accentColor?: string;
}) {
  const color = accentColor ?? '#7C3AED';

  function toggleMultiple(optIndex: number) {
    const current = Array.isArray(answer) ? answer : [];
    const next = current.includes(optIndex) ? current.filter((v) => v !== optIndex) : [...current, optIndex];
    onAnswer(next);
  }

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-widest text-text-muted">
        Pregunta {index + 1} de {total}
      </p>
      <h3 className="mb-6 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
        {def.question}
      </h3>

      {def.type === 'single' && (
        <div className="space-y-3">
          {def.options.map((opt, i) => {
            const selected = answer === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onAnswer(i)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-all',
                  selected ? 'text-white' : 'border-border bg-bg-card text-text-secondary hover:border-white/20'
                )}
                style={selected ? { borderColor: color, backgroundColor: `${color}1A` } : undefined}
              >
                {opt}
                {selected && <Check className="h-4 w-4" style={{ color }} />}
              </button>
            );
          })}
        </div>
      )}

      {def.type === 'multiple' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Puedes marcar varias opciones.</p>
          {def.options.map((opt, i) => {
            const selected = Array.isArray(answer) && answer.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleMultiple(i)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-all',
                  selected ? 'text-white' : 'border-border bg-bg-card text-text-secondary hover:border-white/20'
                )}
                style={selected ? { borderColor: color, backgroundColor: `${color}1A` } : undefined}
              >
                {opt}
                {selected && <Check className="h-4 w-4" style={{ color }} />}
              </button>
            );
          })}
        </div>
      )}

      {def.type === 'text' && (
        <Textarea
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="min-h-[140px]"
        />
      )}
    </motion.div>
  );
}
