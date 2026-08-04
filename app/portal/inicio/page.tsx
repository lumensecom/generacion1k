import Link from 'next/link';
import { ArrowRight, TrendingUp, CalendarClock, PlayCircle } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { Progress } from '@/components/ui/progress';
import { RevealCard } from '@/components/animated/RevealCard';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';
import {
  getModules,
  getStudentProgress,
  computeProgressStats,
  getMentors,
  getTestAttempts,
  getPassedModuleIds,
  isModuleUnlocked,
} from '@/lib/portal-data';

export const metadata = { title: 'Inicio | Portal Generación 1K' };

export default async function InicioPage() {
  const session = await requireSession();
  const [modules, progress, mentors, attempts] = await Promise.all([
    getModules(),
    getStudentProgress(session.sid),
    getMentors(),
    getTestAttempts(session.sid),
  ]);

  const passedModuleIds = getPassedModuleIds(attempts);
  const stats = computeProgressStats(modules, progress, passedModuleIds);
  const firstName = session.name.split(' ')[0];
  const recentModules = modules.slice(0, 3);

  return (
    <PortalShell session={session}>
      <section className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Hola, {firstName}
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Bienvenido de vuelta a <span className="accent-text">Generación 1K</span>
        </h1>

        <div className="mt-8 max-w-xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text-secondary">Progreso general</span>
            <span className="font-mono text-brand-yellow">
              <AnimatedNumber value={stats.percent} suffix="%" />
            </span>
          </div>
          <Progress value={stats.percent} />
          {stats.currentModule && (
            <p className="mt-3 text-sm text-text-secondary">
              Módulo actual: <span className="font-semibold text-white">{stats.currentModule.title}</span>
            </p>
          )}
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RevealCard delay={0} className="p-6">
          <Link href={stats.currentModule ? `/portal/modulos/${stats.currentModule.slug}` : '/portal/modulos'}>
            <PlayCircle className="mb-4 h-6 w-6 text-brand-purpleLight" />
            <h3 className="mb-1 font-display text-base font-extrabold">Continuar donde quedé</h3>
            <p className="text-sm text-text-secondary">{stats.currentModule?.title ?? 'Ver todos los módulos'}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-purpleLight">
              Continuar <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </RevealCard>

        <RevealCard delay={0.1} className="p-6">
          <Link href="/portal/mi-progreso">
            <TrendingUp className="mb-4 h-6 w-6 text-brand-yellow" />
            <h3 className="mb-1 font-display text-base font-extrabold">Mi progreso</h3>
            <p className="text-sm text-text-secondary">
              {stats.completedModules} de {stats.totalModules} módulos completados
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-yellow">
              Ver detalle <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </RevealCard>

        <RevealCard delay={0.2} className="p-6">
          <Link href="/portal/mentores">
            <CalendarClock className="mb-4 h-6 w-6 text-brand-pink" />
            <h3 className="mb-1 font-display text-base font-extrabold">Próxima sesión</h3>
            <p className="text-sm text-text-secondary">
              {mentors[0] ? `${mentors[0].name} · ${mentors[0].role}` : 'Por confirmar'}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-pink">
              Ver mentores <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </RevealCard>
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Módulos recientes</h2>
          <Link href="/portal/modulos" className="text-xs font-bold text-brand-purpleLight hover:text-white">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {recentModules.map((m, i) => (
            <ModuleCard
              key={m.id}
              module={m}
              index={m.order_index}
              videoWatched={Boolean(stats.byModule.get(m.id)?.video_watched)}
              completed={Boolean(stats.byModule.get(m.id)?.module_completed)}
              unlocked={isModuleUnlocked(modules, i, passedModuleIds, session.role === 'admin')}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* Zona clara insertada dentro del dashboard oscuro, como respiro visual */}
      <section className="rounded-3xl border border-light-border bg-light-bg p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-light-text">Mentores invitados</h2>
          <Link href="/portal/mentores" className="text-xs font-bold text-brand-purple hover:text-black">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mentors.map((mentor, i) => (
            <RevealCard key={mentor.id} variant="light" delay={i * 0.08} className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple/25 to-brand-pink/15 font-display text-sm font-extrabold text-brand-purple">
                {mentor.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <h3 className="mb-1 font-display text-base font-extrabold text-light-text">{mentor.name}</h3>
              <p className="text-xs text-light-text2">{mentor.role}</p>
            </RevealCard>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
