import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle, Circle } from 'lucide-react';
import { RevealCard } from '@/components/animated/RevealCard';
import { cn } from '@/lib/utils';
import type { ModuleRow } from '@/lib/types';

type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

function statusOf(m: ModuleRow, videoWatched: boolean, completed: boolean): ModuleStatus {
  if (m.is_locked) return 'locked';
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

export function ModuleCard({
  module: m,
  index,
  videoWatched,
  completed,
  delay = 0,
}: {
  module: ModuleRow;
  index: number;
  videoWatched: boolean;
  completed: boolean;
  delay?: number;
}) {
  const status = statusOf(m, videoWatched, completed);
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const locked = status === 'locked';

  const content = (
    <RevealCard delay={delay} hover={!locked} className={cn('relative overflow-hidden p-6', locked && 'opacity-60')}>
      <span className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-7xl font-extrabold text-brand-purple/10">
        {String(index).padStart(2, '0')}
      </span>
      <div className={cn('mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest', meta.className)}>
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </div>
      <h3 className="mb-1.5 font-display text-lg font-extrabold leading-snug tracking-tight">{m.title}</h3>
      {m.subtitle && <p className="text-sm text-text-secondary">{m.subtitle}</p>}
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
