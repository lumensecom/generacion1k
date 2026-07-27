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
  unlocked = !m.is_locked,
  delay = 0,
  theme = 'dark',
}: {
  module: ModuleRow;
  index: number;
  videoWatched: boolean;
  completed: boolean;
  /** Bloqueo secuencial + override manual del admin. Por defecto respeta solo is_locked. */
  unlocked?: boolean;
  delay?: number;
  theme?: 'dark' | 'light';
}) {
  const light = theme === 'light';
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
