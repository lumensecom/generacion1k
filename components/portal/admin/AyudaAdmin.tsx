'use client';

import { useState, useTransition } from 'react';
import { MessageCircleQuestion, CalendarClock, Video, Check, X } from 'lucide-react';
import {
  responderPreguntaAdmin,
  cerrarPreguntaAdmin,
  actualizarReunionAdmin,
} from '@/app/portal/admin/actions';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paraInputFechaHora as paraInput } from '@/lib/agenda';
import type { StudentQuestion, MeetingRequest, Student } from '@/lib/types';

type Pregunta = StudentQuestion & { student: Student | null };
type Reunion = MeetingRequest & { student: Student | null };

function fecha(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AyudaAdmin({ preguntas, reuniones }: { preguntas: Pregunta[]; reuniones: Reunion[] }) {
  const pendientes = preguntas.filter((p) => p.status === 'nueva');
  const resto = preguntas.filter((p) => p.status !== 'nueva');
  const reunionesPendientes = reuniones.filter((r) => r.status === 'pendiente');
  const reunionesResto = reuniones.filter((r) => r.status !== 'pendiente');

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold">
          <MessageCircleQuestion className="h-4 w-4 text-brand-yellow" />
          Preguntas sin responder
          {pendientes.length > 0 && (
            <span className="rounded-full bg-brand-yellow px-2 py-0.5 font-mono text-[10px] text-black">
              {pendientes.length}
            </span>
          )}
        </h3>
        {pendientes.length === 0 ? (
          <p className="rounded-xl border border-border bg-bg-card px-5 py-6 text-center text-[13.5px] text-text-muted">
            No hay preguntas pendientes.
          </p>
        ) : (
          <div className="space-y-4">
            {pendientes.map((p) => (
              <TarjetaPregunta key={p.id} pregunta={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold">
          <CalendarClock className="h-4 w-4 text-brand-purpleLight" />
          Reuniones solicitadas
          {reunionesPendientes.length > 0 && (
            <span className="rounded-full bg-brand-purple px-2 py-0.5 font-mono text-[10px] text-white">
              {reunionesPendientes.length}
            </span>
          )}
        </h3>
        {reuniones.length === 0 ? (
          <p className="rounded-xl border border-border bg-bg-card px-5 py-6 text-center text-[13.5px] text-text-muted">
            Nadie ha pedido reunión todavía.
          </p>
        ) : (
          <div className="space-y-4">
            {[...reunionesPendientes, ...reunionesResto].map((r) => (
              <TarjetaReunion key={r.id} reunion={r} />
            ))}
          </div>
        )}
      </section>

      {resto.length > 0 && (
        <section>
          <h3 className="mb-4 font-display text-base font-extrabold">Preguntas ya respondidas</h3>
          <div className="space-y-4">
            {resto.map((p) => (
              <TarjetaPregunta key={p.id} pregunta={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TarjetaPregunta({ pregunta: p }: { pregunta: Pregunta }) {
  const [abierto, setAbierto] = useState(p.status === 'nueva');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    formData.set('id', p.id);
    start(async () => {
      const r = await responderPreguntaAdmin(formData);
      if (r?.error) return setError(r.error);
      setAbierto(false);
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="border-b border-border/70 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="font-display text-[14px] font-extrabold">
            {p.student?.full_name ?? 'Estudiante'}
          </span>
          <span className="font-mono text-[11px] text-text-muted">{fecha(p.created_at)}</span>
          {p.module_slug && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-text-muted">
              {p.module_slug}
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[10px] uppercase',
              p.status === 'nueva' ? 'bg-brand-yellow/15 text-brand-yellow' : 'bg-brand-success/15 text-brand-success'
            )}
          >
            {p.status === 'nueva' ? 'sin responder' : p.status.replace('_', ' ')}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-white">{p.question}</p>
      </div>

      {p.admin_reply && !abierto && (
        <div className="bg-brand-purple/[0.06] p-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-brand-purpleLight">
            Tu respuesta
          </p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">{p.admin_reply}</p>
          {p.reply_video_url && (
            <div className="mt-4 max-w-md">
              <VideoPlayer url={p.reply_video_url} titulo="Respuesta en video" />
            </div>
          )}
        </div>
      )}

      {abierto ? (
        <form action={enviar} className="space-y-4 p-5">
          <label className="block">
            <span className="text-[12.5px] font-bold text-text-secondary">Recomendación</span>
            <textarea
              name="reply"
              rows={4}
              defaultValue={p.admin_reply ?? ''}
              placeholder="Lo que tiene que hacer, en concreto…"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-text-secondary">
              <Video className="h-3.5 w-3.5" /> Video de respuesta
              <span className="font-normal text-text-muted">(URL de Bunny o Cloudinary, opcional)</span>
            </span>
            <input
              name="videoUrl"
              defaultValue={p.reply_video_url ?? ''}
              placeholder="https://res.cloudinary.com/…/video/upload/…"
              className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 font-mono text-[12.5px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Enviar respuesta'}
            </Button>
            <Button type="button" variant="subtle" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            {p.status !== 'cerrada' && (
              <Button
                type="button"
                variant="subtle"
                onClick={() => start(async () => void (await cerrarPreguntaAdmin(p.id)))}
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Cerrar sin responder
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="p-5 pt-0">
          <Button type="button" variant="subtle" onClick={() => setAbierto(true)}>
            Editar respuesta
          </Button>
        </div>
      )}
    </article>
  );
}

function TarjetaReunion({ reunion: r }: { reunion: Reunion }) {
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    formData.set('id', r.id);
    start(async () => {
      const res = await actualizarReunionAdmin(formData);
      if (res?.error) return setError(res.error);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    });
  }

  return (
    <article className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="font-display text-[14px] font-extrabold">
          {r.student?.full_name ?? 'Estudiante'}
        </span>
        <span className="font-mono text-[11px] text-text-muted">{fecha(r.created_at)}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase text-text-muted">
          {r.status}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-white">{r.question}</p>
      {r.availability && (
        <p className="mt-2 text-[13px] text-text-muted">
          <span className="font-semibold">Disponibilidad:</span> {r.availability}
        </p>
      )}

      <form action={enviar} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] font-bold text-text-secondary">Estado</span>
            <select
              name="status"
              defaultValue={r.status}
              className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-brand-purple/60"
            >
              <option value="pendiente">Pendiente</option>
              <option value="agendada">Agendada</option>
              <option value="hecha">Hecha</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-bold text-text-secondary">Fecha y hora</span>
            <input
              type="datetime-local"
              name="scheduledAt"
              defaultValue={paraInput(r.scheduled_at)}
              className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-brand-purple/60"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[12px] font-bold text-text-secondary">Nota para el estudiante</span>
          <input
            name="adminNote"
            defaultValue={r.admin_note ?? ''}
            placeholder="Ej: te mando el link por WhatsApp"
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[13.5px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2 text-[12.5px] text-brand-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="subtle" disabled={pending}>
          {guardado ? <Check className="mr-1.5 h-3.5 w-3.5 text-brand-success" /> : null}
          {pending ? 'Guardando…' : guardado ? 'Guardado' : 'Guardar'}
        </Button>
      </form>
    </article>
  );
}
