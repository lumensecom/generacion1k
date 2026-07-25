'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { savePersonalNotes } from '@/app/portal/mi-progreso/actions';
import { Textarea } from '@/components/ui/textarea';

export function PersonalNotes({ initialNotes }: { initialNotes: string }) {
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
    <div className="rounded-2xl border border-border bg-bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-base font-extrabold">Notas personales</p>
        <span className="text-[11px] text-text-muted">{saved ? 'Guardado' : 'Guardando…'}</span>
      </div>
      <p className="mb-4 text-xs text-text-muted">
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
