import Link from 'next/link';
import { Users, UserPlus, UserX, Flame } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { AdminTabs } from '@/components/portal/admin/AdminTabs';
import { StudentsTable } from '@/components/portal/admin/StudentsTable';
import { ModulesManager } from '@/components/portal/admin/ModulesManager';
import { ConfigPanel } from '@/components/portal/admin/ConfigPanel';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import {
  getAdminSummary,
  getAllStudents,
  getModules,
  getPortalConfig,
  getPreguntasConEstudiante,
  getReunionesConEstudiante,
  getClases,
  getEncuestaAbierta,
  getVotos,
  getProximasSesiones,
} from '@/lib/portal-data';
import { AyudaAdmin } from '@/components/portal/admin/AyudaAdmin';
import { ClasesAdmin } from '@/components/portal/admin/ClasesAdmin';
import { CrearEstudiante } from '@/components/portal/admin/CrearEstudiante';

export const metadata = { title: 'Admin | Portal Generación 1K' };

export default async function AdminPage() {
  const session = await requireSession();
  const [summary, students, modules, accessCode, isActive, generation, videoBienvenida, preguntas, reuniones, clases, encuesta, proximasSesiones] =
    await Promise.all([
      getAdminSummary(),
      getAllStudents(),
      getModules(),
      getPortalConfig('access_code'),
      getPortalConfig('is_active'),
      getPortalConfig('current_generation'),
      getPortalConfig('onboarding_video_url'),
      getPreguntasConEstudiante(),
      getReunionesConEstudiante(),
      getClases(),
      getEncuestaAbierta(),
      getProximasSesiones(),
    ]);

  const votos = encuesta ? await getVotos(encuesta.id) : [];
  const conteos: Record<string, number> = {};
  for (const v of votos) conteos[v.option_id] = (conteos[v.option_id] ?? 0) + 1;

  const resumen = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Estudiantes activos', value: summary.totalStudents, icon: Users, color: 'text-brand-purpleLight' },
          { label: 'Nuevos esta semana', value: summary.newThisWeek, icon: UserPlus, color: 'text-brand-success' },
          { label: 'Inactivos +7 días', value: summary.inactive7d, icon: UserX, color: 'text-brand-danger' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-bg-card p-6">
            <stat.icon className={`mb-3 h-5 w-5 ${stat.color}`} />
            <p className="font-mono text-2xl font-medium text-white">
              <AnimatedNumber value={stat.value} />
            </p>
            <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-border bg-bg-card p-6">
          <Flame className="mb-3 h-5 w-5 text-brand-yellow" />
          <p className="font-display text-sm font-extrabold leading-snug">
            {summary.mostViewedModule?.title ?? 'Sin datos aún'}
          </p>
          <p className="mt-1 text-xs text-text-muted">Módulo más visto</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-base font-extrabold">Próximas sesiones 1:1</h3>
        <div className="space-y-2">
          {proximasSesiones.length === 0 && (
            <p className="text-sm text-text-secondary">No hay sesiones agendadas.</p>
          )}
          {proximasSesiones.map((s) => (
            <Link
              key={s.id}
              href={`/portal/admin/estudiantes/${s.student_id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-card px-5 py-3 hover:border-brand-purple/40"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {s.student?.full_name ?? 'Estudiante'}
                  <span className="ml-2 font-normal text-text-muted">
                    · {s.title?.trim() || `Sesión ${s.session_number}`}
                  </span>
                </span>
                {s.student_topic && (
                  <span className="mt-0.5 block truncate text-xs text-brand-purpleLight">
                    Pidió: {s.student_topic}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-xs text-text-secondary">
                {s.scheduled_at
                  ? new Date(s.scheduled_at).toLocaleString('es-CO', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'sin fecha'}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-base font-extrabold">Top 5 por progreso</h3>
        <div className="space-y-2">
          {summary.topStudents.length === 0 && <p className="text-sm text-text-secondary">Sin estudiantes todavía.</p>}
          {summary.topStudents.map((s) => (
            <Link
              key={s.id}
              href={`/portal/admin/estudiantes/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-bg-card px-5 py-3 hover:border-brand-purple/40"
            >
              <span className="text-sm font-semibold">{s.full_name}</span>
              <span className="font-mono text-sm text-brand-yellow">{summary.progressByStudent.get(s.id) ?? 0}%</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PortalShell session={session}>
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-yellow">Panel de admin</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Hola, <span className="accent-text">Juan</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <AdminTabs
        resumen={resumen}
        estudiantes={
          <>
            <CrearEstudiante />
            <StudentsTable students={students} progressByStudent={summary.progressByStudent} />
          </>
        }
        ayuda={<AyudaAdmin preguntas={preguntas} reuniones={reuniones} />}
        clases={<ClasesAdmin clases={clases} encuesta={encuesta} conteos={conteos} />}
        modulos={<ModulesManager modules={modules} />}
        configuracion={
          <ConfigPanel
            initialActive={isActive === 'true'}
            initialCode={accessCode ?? ''}
            initialVideo={videoBienvenida ?? ''}
            generation={generation ?? '1'}
          />
        }
      />
    </PortalShell>
  );
}
