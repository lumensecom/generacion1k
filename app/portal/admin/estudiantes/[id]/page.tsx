import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { StudentActiveToggle } from '@/components/portal/admin/StudentActiveToggle';
import { ResetPassword } from '@/components/portal/admin/ResetPassword';
import { Button } from '@/components/ui/button';
import { getModuleContent } from '@/lib/modules-content';
import type { TestAnswerValue } from '@/lib/modules-content';
import {
  getStudentById,
  getStudentIntake,
  getModules,
  getStudentProgress,
  computeProgressStats,
  getStudentActivity,
  getTestAttempts,
  getSesionesDeEstudiante,
} from '@/lib/portal-data';
import { PlanPagosAdmin } from '@/components/portal/admin/PlanPagosAdmin';

export const metadata = { title: 'Perfil de estudiante | Admin' };

const intakeLabels: Record<string, string> = {
  occupation: '¿A qué se dedica?',
  economic_situation: 'Situación económica',
  income_goal: 'Meta de ingresos mes 1',
  daily_hours: 'Horas disponibles al día',
  investment_capital: 'Capital para invertir',
  biggest_fear: 'Miedo más grande al emprender',
  why_chose_program: 'Por qué eligió el programa',
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

const activityLabels: Record<string, string> = {
  login: 'Inició sesión',
  video_watched: 'Vio un video',
  practice_completed: 'Completó una práctica',
  module_completed: 'Completó un módulo',
  intake_completed: 'Completó el cuestionario inicial',
  test_passed: 'Aprobó un test',
  test_failed: 'No aprobó un test',
};

function answerLabel(question: { type: string; options?: string[] }, value: TestAnswerValue): string {
  if (value === null || value === undefined) return '(sin responder)';
  if (question.type === 'single' && typeof value === 'number') return question.options?.[value] ?? String(value);
  if (question.type === 'multiple' && Array.isArray(value)) {
    return value.map((i) => question.options?.[i] ?? i).join(', ') || '(ninguna opción)';
  }
  if (typeof value === 'string') return value || '(vacío)';
  return String(value);
}

export default async function AdminStudentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const [student, intake, modules, progress, activity, testAttempts, sesiones] = await Promise.all([
    getStudentById(params.id),
    getStudentIntake(params.id),
    getModules(),
    getStudentProgress(params.id),
    getStudentActivity(params.id),
    getTestAttempts(params.id),
    getSesionesDeEstudiante(params.id),
  ]);

  if (!student) notFound();

  const stats = computeProgressStats(modules, progress);
  const waLink = student.phone ? `https://wa.me/${student.phone.replace(/[^0-9]/g, '')}` : null;

  const latestAttemptByModule = new Map<string, (typeof testAttempts)[number]>();
  for (const a of testAttempts) {
    if (!latestAttemptByModule.has(a.module_id)) latestAttemptByModule.set(a.module_id, a);
  }

  return (
    <PortalShell session={session}>
      <Link href="/portal/admin" className="mb-6 inline-block text-xs text-text-muted hover:text-white">
        ← Volver al panel de admin
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{student.full_name}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {student.email} {student.city && `· ${student.city}`} {student.age && `· ${student.age} años`}
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="subtle" size="sm">
                <MessageCircle className="h-3.5 w-3.5" /> Enviar mensaje
              </Button>
            </a>
          )}
          <ResetPassword studentId={student.id} nombre={student.full_name} />
          <StudentActiveToggle studentId={student.id} isActive={student.is_active} />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-bg-card p-5 text-center">
          <p className="font-mono text-2xl text-brand-yellow">{stats.percent}%</p>
          <p className="mt-1 text-xs text-text-muted">progreso</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-5 text-center">
          <p className="font-mono text-2xl text-white">
            {stats.completedModules}/{stats.totalModules}
          </p>
          <p className="mt-1 text-xs text-text-muted">módulos</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-5 text-center">
          <p className="font-mono text-2xl text-white">{stats.videosWatched}</p>
          <p className="mt-1 text-xs text-text-muted">videos vistos</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-extrabold">Cuestionario inicial</h2>
        {!intake ? (
          <p className="text-sm text-text-secondary">Todavía no completó el cuestionario.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(intakeLabels).map(([key, label]) => (
              <div key={key} className="rounded-xl border border-border bg-bg-card p-4">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
                <p className="text-sm text-white">{(intake as never)[key] || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-extrabold">Progreso por módulo</h2>
        <div className="space-y-2">
          {modules.map((m) => {
            const p = stats.byModule.get(m.id);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-card px-5 py-3 text-sm"
              >
                <span className="font-semibold">{m.title}</span>
                <div className="flex gap-4 text-xs text-text-muted">
                  <span className={p?.video_watched ? 'text-brand-success' : ''}>
                    Video {p?.video_watched ? '✓' : '—'}
                  </span>
                  <span className={p?.practice_completed ? 'text-brand-success' : ''}>
                    Práctica {p?.practice_completed ? '✓' : '—'}
                  </span>
                  <span className={p?.module_completed ? 'text-brand-success' : ''}>
                    Completado {p?.module_completed ? '✓' : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-extrabold">Resultados de tests</h2>
        <div className="space-y-4">
          {modules.map((m) => {
            const attempt = latestAttemptByModule.get(m.id);
            const content = getModuleContent(m.slug);
            if (!attempt) {
              return (
                <div key={m.id} className="rounded-xl border border-border/60 bg-bg-card px-5 py-3 text-sm text-text-muted">
                  {m.title} — sin intentos todavía
                </div>
              );
            }
            return (
              <div key={m.id} className="rounded-xl border border-border bg-bg-card p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">{m.title}</span>
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      attempt.passed ? 'bg-brand-success/12 text-brand-success' : 'bg-brand-danger/12 text-brand-danger'
                    }`}
                  >
                    {attempt.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {attempt.score}/{attempt.total_questions} · intento #{attempt.attempt_number}
                  </span>
                </div>

                {content && (
                  <div className="space-y-2.5">
                    {content.test.map((q, i) => {
                      const value = (attempt.answers as TestAnswerValue[])[i] ?? null;
                      const correct =
                        q.type === 'single'
                          ? value === q.correctIndex
                          : q.type === 'multiple'
                            ? Array.isArray(value) &&
                              [...value].sort().join(',') === [...q.correctIndices].sort().join(',')
                            : null;
                      return (
                        <div key={i} className="border-t border-border/60 pt-2.5 text-xs">
                          <p className="mb-1 text-text-muted">{q.question}</p>
                          <p className={correct === false ? 'text-brand-danger' : 'text-text-secondary'}>
                            {answerLabel(q, value)}
                            {correct !== null && (correct ? ' ✓' : ' ✗')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {student.personal_notes && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg font-extrabold">Notas personales del estudiante</h2>
          <div className="rounded-xl border border-border bg-bg-card p-5 text-sm text-text-secondary">
            {student.personal_notes}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg font-extrabold">Plan, pagos y cronograma</h2>
        <PlanPagosAdmin student={student} sesiones={sesiones} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-extrabold">Actividad reciente</h2>
        <div className="space-y-2">
          {activity.length === 0 && <p className="text-sm text-text-secondary">Sin actividad registrada.</p>}
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2.5 text-xs">
              <span className="text-text-secondary">{activityLabels[a.action] ?? a.action}</span>
              <span className="text-text-muted">{fmtDateTime(a.created_at)}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
