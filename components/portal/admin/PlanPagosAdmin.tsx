'use client';

import { useState, useTransition } from 'react';
import { Check, CalendarPlus, Trash2, Wallet } from 'lucide-react';
import {
  guardarPlanYPagos,
  generarCronogramaAdmin,
  guardarSesionAdmin,
  borrarSesionAdmin,
} from '@/app/portal/admin/actions';
import { LISTA_PLANES, plan as buscarPlan, sesionesDelEstudiante, formatearDinero } from '@/lib/planes';
import { Button } from '@/components/ui/button';
import type { Student, OneOnOneSession } from '@/lib/types';

/** Un ISO a lo que espera <input type="datetime-local"> (hora local). */
function paraInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

const campo =
  'mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-brand-purple/60';

export function PlanPagosAdmin({
  student,
  sesiones,
}: {
  student: Student;
  sesiones: OneOnOneSession[];
}) {
  return (
    <div className="space-y-8">
      <FormPlan student={student} />
      <GenerarCronograma student={student} yaHay={sesiones.length} />
      <ListaSesiones sesiones={sesiones} />
    </div>
  );
}

function FormPlan({ student }: { student: Student }) {
  const [planId, setPlanId] = useState(student.plan ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, start] = useTransition();

  const p = buscarPlan(planId);

  function enviar(formData: FormData) {
    setError(null);
    formData.set('studentId', student.id);
    start(async () => {
      const r = await guardarPlanYPagos(formData);
      if (r?.error) return setError(r.error);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    });
  }

  return (
    <form action={enviar} className="rounded-2xl border border-border bg-bg-card p-6">
      <h3 className="flex items-center gap-2 font-display text-base font-extrabold">
        <Wallet className="h-4 w-4 text-brand-yellow" /> Plan y pagos
      </h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Plan</span>
          <select name="plan" value={planId} onChange={(e) => setPlanId(e.target.value)} className={campo}>
            <option value="">Sin asignar</option>
            {LISTA_PLANES.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.nombre} — {pl.meses} meses, {pl.sesiones} sesiones
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Fecha de inicio</span>
          <input type="date" name="planStartedAt" defaultValue={student.plan_started_at ?? ''} className={campo} />
        </label>

        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Sesiones{' '}
            <span className="font-normal text-text-muted">
              (vacío = {p ? p.sesiones : 'las del plan'})
            </span>
          </span>
          <input
            type="number"
            name="sessionsTotal"
            min={1}
            max={100}
            defaultValue={student.sessions_total ?? ''}
            placeholder={p ? String(p.sesiones) : ''}
            className={campo}
          />
        </label>

        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Moneda</span>
          <input name="currency" defaultValue={student.currency} maxLength={3} className={campo} />
        </label>

        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Total a cobrar</span>
          <input
            name="amountTotal"
            inputMode="decimal"
            defaultValue={student.amount_total_cents ? String(student.amount_total_cents / 100) : ''}
            placeholder={p ? String(p.precioCents / 100) : '0'}
            className={campo}
          />
        </label>

        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Ya pagó</span>
          <input
            name="amountPaid"
            inputMode="decimal"
            defaultValue={student.amount_paid_cents ? String(student.amount_paid_cents / 100) : ''}
            placeholder="0"
            className={campo}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Nota de pagos <span className="font-normal text-text-muted">(la ve el estudiante)</span>
          </span>
          <textarea
            name="paymentNotes"
            rows={2}
            defaultValue={student.payment_notes ?? ''}
            placeholder="Ej: 2 cuotas, la segunda el 15 de septiembre."
            className={`${campo} resize-none`}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {guardado && <Check className="mr-1.5 h-4 w-4 text-brand-success" />}
          {pending ? 'Guardando…' : guardado ? 'Guardado' : 'Guardar plan y pagos'}
        </Button>
        {student.amount_total_cents > 0 && (
          <span className="font-mono text-[12px] text-text-muted">
            Pendiente:{' '}
            {formatearDinero(
              Math.max(0, student.amount_total_cents - student.amount_paid_cents),
              student.currency
            )}
          </span>
        )}
      </div>
    </form>
  );
}

function GenerarCronograma({ student, yaHay }: { student: Student; yaHay: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const total = sesionesDelEstudiante(student.plan, student.sessions_total);

  function enviar(formData: FormData) {
    setError(null);
    formData.set('studentId', student.id);
    start(async () => {
      const r = await generarCronogramaAdmin(formData);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <form action={enviar} className="rounded-2xl border border-brand-purple/25 bg-brand-purple/[0.05] p-6">
      <h3 className="flex items-center gap-2 font-display text-base font-extrabold">
        <CalendarPlus className="h-4 w-4 text-brand-purpleLight" /> Generar cronograma semanal
      </h3>
      <p className="mt-1.5 text-[13px] text-text-muted">
        Pon los horarios de la PRIMERA semana y se repiten cada 7 días. Deja el segundo
        vacío si solo hay una 1:1 semanal. Las sesiones que ya existen no se tocan, así que
        puedes volver a pulsarlo si amplías el plan.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Primera 1:1 de la semana</span>
          <input type="datetime-local" name="slot1" required className={campo} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Segunda 1:1 <span className="font-normal text-text-muted">(opcional)</span>
          </span>
          <input type="datetime-local" name="slot2" className={campo} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Total de sesiones</span>
          <input type="number" name="total" min={1} max={100} defaultValue={total || 24} className={campo} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Duración (min)</span>
          <select name="duracion" defaultValue={90} className={campo}>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-5" disabled={pending}>
        {pending ? 'Generando…' : yaHay > 0 ? 'Completar cronograma' : 'Generar cronograma'}
      </Button>
    </form>
  );
}

function ListaSesiones({ sesiones }: { sesiones: OneOnOneSession[] }) {
  if (sesiones.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-bg-card px-5 py-6 text-center text-[13.5px] text-text-muted">
        Sin sesiones todavía.
      </p>
    );
  }

  const hechas = sesiones.filter((s) => s.status === 'hecha').length;

  return (
    <section>
      <h3 className="mb-4 font-display text-base font-extrabold">
        Sesiones ({hechas}/{sesiones.length} hechas)
      </h3>
      <div className="space-y-3">
        {sesiones.map((s) => (
          <FilaSesion key={s.id} sesion={s} />
        ))}
      </div>
    </section>
  );
}

function FilaSesion({ sesion: s }: { sesion: OneOnOneSession }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    formData.set('id', s.id);
    start(async () => {
      const r = await guardarSesionAdmin(formData);
      if (r?.error) return setError(r.error);
      setGuardado(true);
      setAbierto(false);
      setTimeout(() => setGuardado(false), 2500);
    });
  }

  const fecha = s.scheduled_at
    ? new Date(s.scheduled_at).toLocaleString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'sin fecha';

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-mono text-[11px] text-text-secondary">
            {s.session_number}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[14px] font-extrabold">
              {s.title?.trim() || `Sesión ${s.session_number}`}
            </p>
            <p className="font-mono text-[11px] text-text-muted">
              {fecha} · {s.status}
              {guardado && <span className="ml-2 text-brand-success">guardado</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="subtle" onClick={() => setAbierto((v) => !v)}>
            {abierto ? 'Cerrar' : 'Editar'}
          </Button>
          <button
            type="button"
            onClick={() => start(async () => void (await borrarSesionAdmin(s.id)))}
            aria-label="Borrar sesión"
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {s.student_topic && !abierto && (
        <p className="mt-3 rounded-lg border border-brand-purple/20 bg-brand-purple/[0.06] px-3 py-2 text-[12.5px] leading-relaxed text-text-secondary">
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-brand-purpleLight">
            Pidió tratar:{' '}
          </span>
          {s.student_topic}
        </p>
      )}

      {abierto && (
        <form action={enviar} className="mt-4 space-y-3 border-t border-border/70 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-text-secondary">Título</span>
              <input
                name="title"
                defaultValue={s.title ?? ''}
                placeholder="Ej: Revisión de creativos"
                className={campo}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-text-secondary">Fecha y hora</span>
              <input type="datetime-local" name="scheduledAt" defaultValue={paraInput(s.scheduled_at)} className={campo} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-text-secondary">Duración (min)</span>
              <input type="number" name="durationMinutes" min={15} max={240} defaultValue={s.duration_minutes} className={campo} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-text-secondary">Link de la reunión</span>
              <input name="meetUrl" defaultValue={s.meet_url ?? ''} className={`${campo} font-mono text-[12px]`} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-text-secondary">Estado</span>
              <select name="status" defaultValue={s.status} className={campo}>
                <option value="pendiente">Por agendar</option>
                <option value="agendada">Agendada</option>
                <option value="hecha">Hecha</option>
                <option value="cancelada">Cancelada</option>
                <option value="no_asistio">No asistió</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-text-secondary">
                Grabación <span className="font-normal text-text-muted">(Cloudinary, opcional)</span>
              </span>
              <input name="recordingUrl" defaultValue={s.recording_url ?? ''} className={`${campo} font-mono text-[12px]`} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[12px] font-bold text-text-secondary">
                Notas privadas <span className="font-normal text-text-muted">(no las ve el estudiante)</span>
              </span>
              <textarea name="adminNotes" rows={2} defaultValue={s.admin_notes ?? ''} className={`${campo} resize-none`} />
            </label>
          </div>

          {error && <p className="text-[12.5px] text-brand-danger">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar sesión'}
          </Button>
        </form>
      )}
    </div>
  );
}
