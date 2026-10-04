import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarClock, LifeBuoy, PlayCircle, Workflow } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { RitmoSemanal } from '@/components/portal/RitmoSemanal';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { RecorridoMentoria } from '@/components/portal/RecorridoMentoria';
import { MetricasEstudiante } from '@/components/portal/MetricasEstudiante';
import { CredencialesMentoria } from '@/components/portal/CredencialesMentoria';
import {
  getModules,
  getStudentProgress,
  computeProgressStats,
  getTestAttempts,
  getPassedModuleIds,
  isModuleUnlocked,
  getStudentById,
  getCheckins,
  computeStreak,
  getSesionesDeEstudiante,
} from '@/lib/portal-data';
import { sesionesDelEstudiante } from '@/lib/planes';
import { calcularRecorrido } from '@/lib/recorrido';
import { fechaBonita } from '@/lib/recorrido';
import {
  CLAVE_MENTORIA,
  CORREO_MENTORIA,
  HERRAMIENTAS_A_PEDIDO,
  herramientasDe,
  herramientasFaltantes,
  linkWhatsApp,
} from '@/lib/herramientas';

export const metadata = { title: 'Inicio | Portal Generación 1K' };

export default async function InicioPage() {
  const session = await requireSession();

  const [modules, progress, attempts, estudiante, checkins, sesiones] = await Promise.all([
    getModules(),
    getStudentProgress(session.sid),
    getTestAttempts(session.sid),
    getStudentById(session.sid),
    getCheckins(session.sid, 90),
    getSesionesDeEstudiante(session.sid),
  ]);

  const passedModuleIds = getPassedModuleIds(attempts);
  const stats = computeProgressStats(modules, progress, passedModuleIds);
  const nombre = session.name.split(' ')[0];

  const recorrido = estudiante ? calcularRecorrido(estudiante) : null;

  const activas = herramientasDe(session.email, session.name);
  const faltantes = herramientasFaltantes(session.email, session.name);

  const metricas = {
    porcentaje: stats.percent,
    modulosHechos: stats.completedModules,
    modulosTotales: stats.totalModules,
    leccionesVistas: progress.reduce((s, p) => s + (p.lessons_done?.length ?? 0), 0),
    testsAprobados: passedModuleIds.size,
    racha: computeStreak(checkins),
    diasActivos: checkins.filter((c) => c.worked_today).length,
    sesionesTomadas: sesiones.filter((s) => s.status === 'hecha').length,
    sesionesTotales: sesionesDelEstudiante(estudiante?.plan, estudiante?.sessions_total),
    ultimoIngreso: estudiante?.last_login_at
      ? fechaBonita(new Date(estudiante.last_login_at))
      : null,
    primerIngreso: estudiante?.first_login_at
      ? fechaBonita(new Date(estudiante.first_login_at))
      : null,
  };

  // Lo siguiente que le toca, resuelto aquí y no en su cabeza: el botón
  // grande apunta a un solo sitio y no hay que elegir entre cinco.
  const siguiente = stats.currentModule;

  return (
    <PortalShell session={session}>
      <section className="mb-7">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Hola, {nombre}
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tu panel de <span className="accent-text">Generación 1K</span>
        </h1>
      </section>

      {/* Lo único que tiene que hacer ahora. Primero, grande y sin competencia. */}
      {siguiente && (
        <Link
          href={`/portal/modulos/${siguiente.slug}`}
          className="group mb-7 flex items-center gap-5 rounded-3xl border border-brand-purple/35 bg-gradient-to-r from-brand-purple/18 to-transparent px-6 py-5 transition-all hover:border-brand-purple/60"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-purple/25 text-brand-purpleLight">
            <PlayCircle className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-brand-purpleLight">
              Continúa aquí
            </span>
            <span className="mt-1 block truncate font-display text-[19px] font-extrabold tracking-tight">
              {siguiente.title}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-brand-purpleLight transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      {recorrido && (
        <div className="mb-7">
          <RecorridoMentoria recorrido={recorrido} nombre={nombre} />
        </div>
      )}

      <div className="mb-7">
        <h2 className="mb-4 font-display text-xl font-extrabold tracking-tight">Cómo vas</h2>
        <MetricasEstudiante m={metricas} />
      </div>

      <div className="mb-7">
        <CredencialesMentoria
          correo={CORREO_MENTORIA}
          clave={CLAVE_MENTORIA}
          activas={activas}
          faltantes={faltantes}
          aPedido={HERRAMIENTAS_A_PEDIDO}
          linkPedir={linkWhatsApp(
            `Hola Juan, soy ${session.name} de Generación 1K. Quiero pedirte acceso a una herramienta.`
          )}
        />
      </div>

      <section className="mb-7">
        <RitmoSemanal />
      </section>

      <section className="mb-7">
        <h2 className="mb-4 font-display text-xl font-extrabold tracking-tight">
          A dónde ir
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Atajo
            href="/portal/modulos"
            icono={BookOpen}
            color="#A855F7"
            titulo="Módulos"
            pie="Las clases, en orden"
          />
          <Atajo
            href="/portal/frameworks"
            icono={Workflow}
            color="#22D3EE"
            titulo="Frameworks"
            pie="Los procesos dibujados"
          />
          <Atajo
            href="/portal/agenda"
            icono={CalendarClock}
            color="#EC4899"
            titulo="Agenda"
            pie="Tus mentorías y clases"
          />
          <Atajo
            href="/portal/ayuda"
            icono={LifeBuoy}
            color="#F59E0B"
            titulo="Ayuda"
            pie="Pregúntale a Juan"
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Tus módulos</h2>
          <Link
            href="/portal/modulos"
            className="text-xs font-bold text-brand-purpleLight transition-colors hover:text-white"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {modules.slice(0, 3).map((m, i) => (
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
    </PortalShell>
  );
}

function Atajo({
  href,
  icono: Icono,
  color,
  titulo,
  pie,
}: {
  href: string;
  icono: React.ElementType;
  color: string;
  titulo: string;
  pie: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-bg-card px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-white/25"
    >
      <Icono className="h-5 w-5" style={{ color }} />
      <span className="mt-3 block text-[14.5px] font-extrabold">{titulo}</span>
      <span className="mt-0.5 block text-[11.5px] leading-snug text-text-muted">{pie}</span>
    </Link>
  );
}
