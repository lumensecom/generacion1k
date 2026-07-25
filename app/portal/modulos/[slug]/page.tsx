import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ModuleTabsClient } from '@/components/portal/ModuleTabsClient';
import { getModuleBySlug, getModuleResources, getModules, getProgressForModule } from '@/lib/portal-data';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const mod = await getModuleBySlug(params.slug);
  return { title: mod ? `${mod.title} | Portal Generación 1K` : 'Módulo | Portal Generación 1K' };
}

export default async function ModuloDetailPage({ params }: { params: { slug: string } }) {
  const session = await requireSession();
  const [mod, allModules] = await Promise.all([getModuleBySlug(params.slug), getModules()]);
  if (!mod) notFound();

  const [resources, progress] = await Promise.all([
    getModuleResources(mod.id),
    getProgressForModule(session.sid, mod.id),
  ]);

  const orderedIndex = allModules.findIndex((m) => m.id === mod.id);
  const prevSlug = orderedIndex > 0 ? allModules[orderedIndex - 1].slug : null;
  const nextSlug = orderedIndex < allModules.length - 1 ? allModules[orderedIndex + 1].slug : null;

  return (
    <PortalShell session={session}>
      <nav className="mb-6 text-xs text-text-muted">
        <Link href="/portal/modulos" className="hover:text-white">
          Módulos
        </Link>{' '}
        › <span className="text-text-secondary">{mod.title}</span>
      </nav>

      <div className="mb-8">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Módulo {orderedIndex + 1} de {allModules.length}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{mod.title}</h1>
        {mod.subtitle && <p className="mt-2 max-w-2xl text-text-secondary">{mod.subtitle}</p>}
      </div>

      {mod.is_locked ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card px-6 py-16 text-center">
          <Lock className="h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-secondary">
            Este módulo todavía está bloqueado. Se desbloqueará cuando avances en el programa.
          </p>
        </div>
      ) : (
        <ModuleTabsClient
          module={mod}
          resources={resources}
          progress={progress}
          prevSlug={prevSlug}
          nextSlug={nextSlug}
        />
      )}
    </PortalShell>
  );
}
