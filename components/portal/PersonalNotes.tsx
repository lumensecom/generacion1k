'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { savePersonalNotes } from '@/app/portal/mi-progreso/actions';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function PersonalNotes({
  initialNotes,
  theme = 'dark',
}: {
  initialNotes: string;
  theme?: 'dark' | 'light';
}) {
  const light = theme === 'light';
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function handleChange(value: string) {
    setNotes(value);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        await savePersonalNotes(value);
        setSaved(true);
      });
    }, 900);
  }

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        light
          ? 'border-light-border bg-light-card shadow-[0_10px_26px_rgba(20,20,60,0.06)]'
          : 'border-border bg-bg-card'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={cn('font-display text-base font-extrabold', light && 'text-light-text')}>Notas personales</p>
        <span className={cn('text-[11px]', light ? 'text-light-muted' : 'text-text-muted')}>
          {saved ? 'Guardado' : 'Guardando…'}
        </span>
      </div>
      <p className={cn('mb-4 text-xs', light ? 'text-light-muted' : 'text-text-muted')}>
        Espacio libre para tus reflexiones. Solo lo ves tú y Juan.
      </p>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="¿Cómo va tu semana? ¿Qué aprendiste? ¿Qué te está costando?"
        className="min-h-[160px]"
      />
    </div>
  );
}
