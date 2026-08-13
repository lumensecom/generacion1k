'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TestQuestion } from '@/components/animated/TestQuestion';
import { ResultsScreen } from '@/components/animated/ResultsScreen';
import { Button } from '@/components/ui/button';
import { submitTest } from '@/app/portal/modulos/actions';
import type { TestQuestionDef, TestAnswerValue } from '@/lib/modules-content';

function isAnswered(value: TestAnswerValue): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function isCorrect(def: TestQuestionDef, answer: TestAnswerValue): boolean {
  if (def.type === 'single') return answer === def.correctIndex;
  if (def.type === 'multiple') {
    if (!Array.isArray(answer)) return false;
    const a = [...answer].sort((x, y) => x - y);
    const b = [...def.correctIndices].sort((x, y) => x - y);
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return typeof answer === 'string' && answer.trim().length >= 20;
}

export function TestFlow({
  slug,
  questions,
  accentColor,
  nextSlug,
  onReviewTheory,
}: {
  slug: string;
  questions: TestQuestionDef[];
  accentColor: string;
  nextSlug: string | null;
  onReviewTheory: () => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswerValue[]>(() => questions.map(() => null));
  const [phase, setPhase] = useState<'quiz' | 'results'>('quiz');
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [noGuardado, setNoGuardado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [startedAt] = useState(() => Date.now());

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const canAdvance = isAnswered(answers[index]);

  function setAnswer(value: TestAnswerValue) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function finish() {
    const score = questions.reduce((acc, q, i) => acc + (isCorrect(q, answers[i]) ? 1 : 0), 0);
    const passed = score >= 4;
    setResult({ score, passed });
    setPhase('results');

    startTransition(async () => {
      // Si esto falla en silencio, el estudiante ve "aprobaste" y el módulo
      // siguiente le sigue saliendo bloqueado, sin ninguna explicación: el
      // desbloqueo se calcula desde los intentos guardados, no desde lo que
      // diga la pantalla. Así que el fallo tiene que verse.
      try {
        const r = await submitTest(slug, {
          score,
          totalQuestions: questions.length,
          answers,
          durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        });
        if (r?.error) {
          setNoGuardado(r.error);
          return;
        }
        setNoGuardado(null);
        router.refresh();
      } catch {
        setNoGuardado('No pudimos guardar tu resultado. Revisa tu conexión y repite el test.');
      }
    });
  }

  function retry() {
    setNoGuardado(null);
    setAnswers(questions.map(() => null));
    setIndex(0);
    setResult(null);
    setPhase('quiz');
  }

  if (phase === 'results' && result) {
    return (
      <>
        {noGuardado && (
          <p className="mb-5 rounded-xl border border-brand-danger/30 bg-brand-danger/10 px-4 py-3 text-[13.5px] text-brand-danger">
            {noGuardado} Tu resultado no quedó guardado, así que el módulo siguiente seguirá
            bloqueado hasta que repitas el test.
          </p>
        )}
      <ResultsScreen
        score={result.score}
        total={questions.length}
        passed={result.passed}
        hasNextModule={Boolean(nextSlug)}
        accentColor={accentColor}
        onContinue={() => router.push(nextSlug ? `/portal/modulos/${nextSlug}` : '/portal/modulos')}
        onRetry={retry}
        onReviewTheory={onReviewTheory}
      />
      </>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= index ? accentColor : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <TestQuestion
          key={index}
          def={current}
          index={index}
          total={questions.length}
          answer={answers[index]}
          onAnswer={setAnswer}
          accentColor={accentColor}
        />
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          disabled={!canAdvance || pending}
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          {isLast ? 'Finalizar test' : 'Siguiente'}
          {!isLast && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
