'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';
import { checkinToday } from '@/app/portal/mi-progreso/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CheckinWidget({
  streak,
  checkedInToday,
  last30: initialLast30,
}: {
  streak: number;
  checkedInToday: boolean;
  last30: { date: string; worked: boolean }[];
}) {
  const [done, setDone] = useState(checkedInToday);
  const [last30, setLast30] = useState(initialLast30);
  const [pending, startTransition] = useTransition();

  function handleCheckin() {
    setDone(true);
    const today = new Date().toISOString().slice(0, 10);
    setLast30((prev) => {
      const rest = prev.filter((d) => d.date !== today);
      return [...rest, { date: today, worked: true }];
    });
    startTransition(async () => {
      await checkinToday(true);
      toast.success('¡Racha actualizada! Sigue así.');
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-brand-yellow">
            <Flame className="h-3.5 w-3.5" /> Racha actual
          </p>
          <p className="font-display text-3xl font-extrabold">
            {streak} {streak === 1 ? 'día' : 'días'}
          </p>
        </div>
        <Button type="button" onClick={handleCheckin} disabled={done || pending} size="default">
          {done ? 'Hoy ✓' : 'Hoy trabajé en mi negocio'}
        </Button>
      </div>

      <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
        {last30.map((d, i) => (
          <motion.div
            key={d.date}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.008 }}
            className={cn('aspect-square rounded-[3px]', d.worked ? 'bg-brand-success' : 'bg-white/6')}
            title={d.date}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-text-muted">Últimos 30 días</p>
    </div>
  );
}
