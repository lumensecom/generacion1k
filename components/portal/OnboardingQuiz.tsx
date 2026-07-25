'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { submitIntake, type IntakeAnswers } from '@/app/portal/bienvenida/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type StepKey = keyof IntakeAnswers;

interface StepDef {
  key: StepKey;
  question: string;
  type: 'text' | 'number' | 'choice' | 'textarea';
  placeholder?: string;
  options?: string[];
}

const steps: StepDef[] = [
  { key: 'name', question: '¿Cuál es tu nombre?', type: 'text', placeholder: 'Tu nombre completo' },
  { key: 'age', question: '¿Cuántos años tienes?', type: 'number', placeholder: '18' },
  { key: 'city', question: '¿En qué ciudad vives?', type: 'text', placeholder: 'Bogotá' },
  { key: 'occupation', question: '¿A qué te dedicas actualmente?', type: 'text', placeholder: 'Estudiante, empleado, independiente…' },
  {
    key: 'economic_situation',
    question: '¿Cuál es tu situación económica actual?',
    type: 'choice',
    options: [
      'Vivo con mis papás sin ingresos',
      'Tengo un empleo pero no me alcanza',
      'Freelance / independiente',
      'Ya tengo un negocio propio',
    ],
  },
  {
    key: 'income_goal',
    question: '¿Cuánto quieres ganar en tu primer mes?',
    type: 'choice',
    options: ['$200-500 USD', '$500-1000 USD', '$1000-2000 USD', 'Más de $2000 USD'],
  },
  {
    key: 'daily_hours',
    question: '¿Cuántas horas al día puedes dedicarle?',
    type: 'choice',
    options: ['1-2 horas', '3-5 horas', '6+ horas', 'Todo mi tiempo libre'],
  },
  {
    key: 'investment_capital',
    question: '¿Tienes capital para invertir?',
    type: 'choice',
    options: ['Menos de $100 USD', '$100-300 USD', '$300-500 USD', 'Más de $500 USD'],
  },
  {
    key: 'biggest_fear',
    question: '¿Cuál es tu miedo más grande al emprender?',
    type: 'textarea',
    placeholder: 'Escribe con confianza — esto solo lo ve Juan.',
  },
  {
    key: 'why_chose_program',
    question: '¿Por qué elegiste este programa?',
    type: 'textarea',
    placeholder: 'Cuéntanos qué te hizo decidirte.',
  },
];

const emptyAnswers: IntakeAnswers = {
  name: '',
  age: '',
  city: '',
  occupation: '',
  economic_situation: '',
  income_goal: '',
  daily_hours: '',
  investment_capital: '',
  biggest_fear: '',
  why_chose_program: '',
};

export function OnboardingQuiz({ initialName }: { initialName: string }) {
  const [answers, setAnswers] = useState<IntakeAnswers>({ ...emptyAnswers, name: initialName });
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const step = steps[index];
  const value = answers[step.key];
  const isLast = index === steps.length - 1;
  const canContinue = value.trim().length > 0;

  function update(key: StepKey, v: string) {
    setAnswers((prev) => ({ ...prev, [key]: v }));
  }

  function next() {
    if (!canContinue) return;
    setError(null);
    if (isLast) {
      startTransition(async () => {
        const result = await submitIntake(answers);
        if (result?.error) setError(result.error);
      });
    } else {
      setIndex((i) => i + 1);
    }
  }

  function back() {
    if (index > 0) setIndex((i) => i - 1);
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= index ? 'bg-gradient-to-r from-brand-purple to-brand-pink' : 'bg-white/8'
            )}
          />
        ))}
      </div>
      <p className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-text-muted">
        Pregunta {index + 1} de {steps.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mb-6 text-center font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {step.question}
          </h2>

          {step.type === 'text' && (
            <Input
              autoFocus
              value={value}
              placeholder={step.placeholder}
              onChange={(e) => update(step.key, e.target.value)}
              className="h-14 text-center text-lg"
            />
          )}

          {step.type === 'number' && (
            <Input
              autoFocus
              type="number"
              inputMode="numeric"
              value={value}
              placeholder={step.placeholder}
              onChange={(e) => update(step.key, e.target.value)}
              className="h-14 text-center text-lg"
            />
          )}

          {step.type === 'textarea' && (
            <Textarea
              autoFocus
              value={value}
              placeholder={step.placeholder}
              onChange={(e) => update(step.key, e.target.value)}
              className="min-h-[140px]"
            />
          )}

          {step.type === 'choice' && (
            <div className="space-y-3">
              {step.options!.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update(step.key, option)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-all',
                    value === option
                      ? 'border-brand-purpleLight bg-brand-purple/15 text-white'
                      : 'border-border bg-bg-card text-text-secondary hover:border-brand-purple/40'
                  )}
                >
                  {option}
                  {value === option && <Check className="h-4 w-4 text-brand-purpleLight" />}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 text-center text-sm font-medium text-brand-danger">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={back} disabled={index === 0 || pending} className="px-5">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button type="button" onClick={next} disabled={!canContinue || pending} size="lg" className="flex-1">
          {pending ? 'Guardando…' : isLast ? 'Finalizar' : 'Siguiente'}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
