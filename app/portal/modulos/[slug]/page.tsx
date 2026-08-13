import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ModuleTabsClient } from '@/components/portal/ModuleTabsClient';
import { ModuleHero } from '@/components/animated/ModuleHero';
import { getModuleContent } from '@/lib/modules-content';
import {
  getModuleBySlug,
  getModuleResources,
  getModules,
  getProgressForModule,
  getTestAttempts,
  getAttemptsForModule,
  getPassedModuleIds,
  isModuleUnlocked,
  getPortalConfig,
} from '@/lib/portal-data';
import { aunNoLlega } from '@/lib/agenda';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const mod = await getModuleBySlug(params.slug);
  return { title: mod ? `${mod.title} | Portal Generación 1K` : 'Módulo | Portal Generación 1K' };
}

export default async function ModuloDetailPage({ params }: { params: { slug: string } }) {
  const session = await requireSession();
  const [mod, allModules] = await Promise.all([getModuleBySlug(params.slug), getModules()]);
  if (!mod) notFound();

  const [resources, progress, allAttempts, moduleAttempts, videosDesde] = await Promise.all([
    getModuleResources(mod.id),
    getProgressForModule(session.sid, mod.id),
    getTestAttempts(session.sid),
    getAttemptsForModule(session.sid, mod.id),
    getPortalConfig('videos_desde'),
  ]);

  // Los videos tienen fecha de estreno. Juan los ve siempre, para poder
  // revisar que cada uno quedó bien cargado antes de que se abran.
  const videoDesde =
    session.role !== 'admin' && aunNoLlega(videosDesde) ? videosDesde : null;

  const orderedIndex = allModules.findIndex((m) => m.id === mod.id);
  const prevSlug = orderedIndex > 0 ? allModules[orderedIndex - 1].slug : null;
  const nextSlug = orderedIndex < allModules.length - 1 ? allModules[orderedIndex + 1].slug : null;

  const passedModuleIds = getPassedModuleIds(allAttempts);
  const unlocked = isModuleUnlocked(allModules, orderedIndex, passedModuleIds, session.role === 'admin');
  const content = getModuleContent(mod.slug);
  const latestAttempt = moduleAttempts[0] ?? null;

  const progressSteps = [progress?.video_watched, progress?.practice_completed, progress?.module_completed];
  const modulePercent = Math.round((progressSteps.filter(Boolean).length / 3) * 100);

  return (
    <PortalShell session={session}>
      <nav className="mb-6 text-xs text-text-muted">
        <Link href="/portal/modulos" className="hover:text-white">
          Módulos
        </Link>{' '}
        › <span className="text-text-secondary">{mod.title}</span>
      </nav>

      <div className="mb-8">
        <ModuleHero
          title={mod.title}
          introLine1={content?.introLine1 ?? mod.subtitle ?? mod.title}
          introLine2={content?.introLine2}
          moduleIndex={orderedIndex + 1}
          totalModules={allModules.length}
          progressPercent={modulePercent}
          accentColor={content?.accentColor ?? '#7C3AED'}
        />
      </div>

      {!unlocked ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card px-6 py-16 text-center">
          <Lock className="h-8 w-8 text-text-muted" />
          <p className="max-w-sm text-sm text-text-secondary">
            {mod.is_locked
              ? 'Este módulo todavía está bloqueado. Se desbloqueará cuando Juan lo publique.'
              : `Este módulo se desbloquea cuando apruebas el test de "${allModules[orderedIndex - 1]?.title}" (mínimo 4 de 5).`}
          </p>
          {!mod.is_locked && prevSlug && (
            <Link href={`/portal/modulos/${prevSlug}`}>
              <span className="text-xs font-bold text-brand-purpleLight hover:text-white">
                Ir al módulo anterior →
              </span>
            </Link>
          )}
        </div>
      ) : (
        <ModuleTabsClient
          module={mod}
          content={content}
          resources={resources}
          progress={progress}
          latestAttempt={latestAttempt}
          prevSlug={prevSlug}
          nextSlug={nextSlug}
          videoDesde={videoDesde}
        />
      )}
    </PortalShell>
  );
}
