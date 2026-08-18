import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle, Circle } from 'lucide-react';
import { RevealCard } from '@/components/animated/RevealCard';
import { cn } from '@/lib/utils';
import type { ModuleRow } from '@/lib/types';

type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

function statusOf(unlocked: boolean, videoWatched: boolean, completed: boolean): ModuleStatus {
  if (!unlocked) return 'locked';
  if (completed) return 'completed';
  if (videoWatched) return 'in_progress';
  return 'available';
}

const statusMeta: Record<ModuleStatus, { label: string; icon: typeof Circle; className: string }> = {
  locked: { label: 'Bloqueado', icon: Lock, className: 'text-text-muted' },
  available: { label: 'Disponible', icon: Circle, className: 'text-brand-purpleLight' },
  in_progress: { label: 'En progreso', icon: PlayCircle, className: 'text-brand-yellow' },
  completed: { label: 'Completado', icon: CheckCircle2, className: 'text-brand-success' },
};

// En tema claro, purple-light (lavanda) pierde contraste sobre blanco.
const statusMetaLight: Record<ModuleStatus, string> = {
  locked: 'text-light-muted',
  available: 'text-brand-purple',
  in_progress: 'text-brand-yellow',
  completed: 'text-brand-success',
};

export function ModuleCard({
  module: m,
  index,
  videoWatched,
  completed,
  leccionesHechas = 0,
  totalLecciones = 0,
  unlocked = !m.is_locked,
  delay = 0,
  theme = 'dark',
}: {
  module: ModuleRow;
  index: number;
  videoWatched: boolean;
  completed: boolean;
  leccionesHechas?: number;
  totalLecciones?: number;
  /** Bloqueo secuencial + override manual del admin. Por defecto respeta solo is_locked. */
  unlocked?: boolean;
  delay?: number;
  theme?: 'dark' | 'light';
}) {
  const light = theme === 'light';
  const pct = totalLecciones === 0 ? 0 : Math.round((leccionesHechas / totalLecciones) * 100);
  const status = statusOf(unlocked, videoWatched, completed);
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const locked = status === 'locked';

  const content = (
    <RevealCard
      variant={theme}
      delay={delay}
      hover={!locked}
      className={cn('relative overflow-hidden p-6', locked && 'opacity-60')}
    >
      <span
        className={cn(
          'pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-7xl font-extrabold',
          light ? 'text-brand-purple/8' : 'text-brand-purple/10'
        )}
      >
        {String(index).padStart(2, '0')}
      </span>
      <div
        className={cn(
          'mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest',
          light ? statusMetaLight[status] : meta.className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </div>
      <h3
        className={cn(
          'mb-1.5 font-display text-lg font-extrabold leading-snug tracking-tight',
          light && 'text-light-text'
        )}
      >
        {m.title}
      </h3>
      {m.subtitle && (
        <p className={cn('text-sm', light ? 'text-light-text2' : 'text-text-secondary')}>{m.subtitle}</p>
      )}

      {/* Cuántas lecciones lleva del módulo. Es lo que contesta "¿cuánto me
          falta aquí?" sin tener que entrar a mirarlo. */}
      {!locked && totalLecciones > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className={cn('text-[11.5px]', light ? 'text-light-text2' : 'text-text-muted')}>
              {leccionesHechas} de {totalLecciones} lecciones
            </span>
            <span className="font-mono text-[11.5px] font-bold text-brand-yellow">{pct}%</span>
          </div>
          <div className={cn('h-1 overflow-hidden rounded-full', light ? 'bg-black/[0.07]' : 'bg-white/[0.07]')}>
            <div
              className="h-full rounded-full bg-brand-yellow transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </RevealCard>
  );

  if (locked) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={`/portal/modulos/${m.slug}`} className="block">
      {content}
    </Link>
  );
}
