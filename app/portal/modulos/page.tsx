import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { getModuleContent } from '@/lib/modules-content';
import { leccionesDe } from '@/lib/lecciones';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import {
  getModules,
  getStudentProgress,
  computeProgressStats,
  getTestAttempts,
  getPassedModuleIds,
  isModuleUnlocked,
} from '@/lib/portal-data';

export const metadata = { title: 'Módulos | Portal Generación 1K' };

/** Lecciones con contenido de un módulo y cuántas lleva marcadas el estudiante. */
function contarLecciones(slug: string, vistas: unknown) {
  const lecciones = leccionesDe(getModuleContent(slug)).filter((l) => !l.porEscribir);
  const hechas = Array.isArray(vistas) ? lecciones.filter((l) => vistas.includes(l.id)).length : 0;
  return { hechas, total: lecciones.length };
}

export default async function ModulosPage() {
  const session = await requireSession();
  const [modules, progress, attempts] = await Promise.all([
    getModules(),
    getStudentProgress(session.sid),
    getTestAttempts(session.sid),
  ]);
  const stats = computeProgressStats(modules, progress);
  const passedModuleIds = getPassedModuleIds(attempts);

  return (
    <PortalShell session={session} theme="light">
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purple">El programa</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-light-text sm:text-4xl">
          Todos los <span className="accent-text-light">módulos</span>
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
            leccionesHechas={contarLecciones(m.slug, stats.byModule.get(m.id)?.lessons_done).hechas}
            totalLecciones={contarLecciones(m.slug, stats.byModule.get(m.id)?.lessons_done).total}
            unlocked={isModuleUnlocked(modules, i, passedModuleIds, session.role === 'admin')}
            delay={(i % 3) * 0.08}
            theme="light"
          />
        ))}
      </div>
    </PortalShell>
  );
}
