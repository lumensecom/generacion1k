import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { getModules, getStudentProgress, computeProgressStats } from '@/lib/portal-data';

export const metadata = { title: 'Módulos | Portal Generación 1K' };

export default async function ModulosPage() {
  const session = await requireSession();
  const [modules, progress] = await Promise.all([getModules(), getStudentProgress(session.sid)]);
  const stats = computeProgressStats(modules, progress);

  return (
    <PortalShell session={session}>
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">El programa</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Todos los <span className="accent-text">módulos</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => (
          <ModuleCard
            key={m.id}
            module={m}
            index={m.order_index}
            videoWatched={Boolean(stats.byModule.get(m.id)?.video_watched)}
            completed={Boolean(stats.byModule.get(m.id)?.module_completed)}
            delay={(i % 3) * 0.08}
          />
        ))}
      </div>
    </PortalShell>
  );
}
