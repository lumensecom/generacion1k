import { CheckCircle2, PlayCircle, Circle, Lock } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { CircularProgress } from '@/components/portal/CircularProgress';
import { CheckinWidget } from '@/components/portal/CheckinWidget';
import { PersonalNotes } from '@/components/portal/PersonalNotes';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { SlideInBlock } from '@/components/animated/SlideInBlock';
import {
  getModules,
  getStudentProgress,
  computeProgressStats,
  getCheckins,
  computeStreak,
  getStudentById,
} from '@/lib/portal-data';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Mi progreso | Portal Generación 1K' };

function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default async function MiProgresoPage() {
  const session = await requireSession();
  const [modules, progress, checkins, student] = await Promise.all([
    getModules(),
    getStudentProgress(session.sid),
    getCheckins(session.sid, 30),
    getStudentById(session.sid),
  ]);

  const stats = computeProgressStats(modules, progress);
  const streak = computeStreak(checkins);
  const today = new Date().toISOString().slice(0, 10);
  const checkinMap = new Map(checkins.map((c) => [c.date, c.worked_today]));
  const checkedInToday = checkinMap.get(today) === true;

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, worked: checkinMap.get(key) === true };
  });

  const startedAt = student?.first_login_at ?? student?.invited_at ?? new Date().toISOString();

  return (
    <PortalShell session={session} theme="light">
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purple">Mi progreso</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-light-text sm:text-4xl">
          Así vas en <span className="accent-text-light">Generación 1K</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <section className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-light-border bg-light-card p-8 shadow-[0_10px_26px_rgba(20,20,60,0.06)] sm:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <CircularProgress percent={stats.percent} theme="light" />
        </div>
        <div className="grid grid-cols-3 gap-4 self-center text-center">
          <div>
            <p className="font-mono text-2xl font-medium text-light-text">{daysSince(startedAt)}</p>
            <p className="mt-1 text-xs text-light-muted">días desde que empezaste</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-medium text-light-text">
              {stats.completedModules}/{stats.totalModules}
            </p>
            <p className="mt-1 text-xs text-light-muted">módulos completados</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-medium text-light-text">
              {stats.videosWatched}/{stats.totalModules}
            </p>
            <p className="mt-1 text-xs text-light-muted">videos vistos</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 font-display text-xl font-extrabold tracking-tight text-light-text">Línea de tiempo</h2>
        <div className="space-y-1 border-l border-light-border pl-6">
          {modules.map((m, i) => {
            const p = stats.byModule.get(m.id);
            const state = m.is_locked ? 'locked' : p?.module_completed ? 'done' : p?.video_watched ? 'progress' : 'pending';
            const Icon = state === 'done' ? CheckCircle2 : state === 'progress' ? PlayCircle : state === 'locked' ? Lock : Circle;
            const dotColor =
              state === 'done' ? 'bg-brand-success' : state === 'progress' ? 'bg-brand-yellow' : state === 'locked' ? 'bg-light-muted' : 'bg-light-border';

            return (
              <SlideInBlock key={m.id} delay={i * 0.04} className="relative py-3">
                <span
                  className={cn(
                    'absolute -left-[29px] top-4 h-3 w-3 rounded-full',
                    dotColor,
                    state === 'progress' && 'animate-pulseDot'
                  )}
                />
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      state === 'done' ? 'text-brand-success' : state === 'progress' ? 'text-brand-yellow' : 'text-light-muted'
                    )}
                  />
                  <span className={cn('text-sm font-semibold', state === 'locked' ? 'text-light-muted' : 'text-light-text')}>
                    {m.title}
                  </span>
                </div>
              </SlideInBlock>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 font-display text-xl font-extrabold tracking-tight text-light-text">Hábitos</h2>
        <CheckinWidget streak={streak} checkedInToday={checkedInToday} last30={last30} theme="light" />
      </section>

      <section>
        <PersonalNotes initialNotes={student?.personal_notes ?? ''} theme="light" />
      </section>
    </PortalShell>
  );
}
