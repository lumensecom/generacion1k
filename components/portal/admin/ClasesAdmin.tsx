'use client';

import { useState, useTransition } from 'react';
import { CalendarPlus, Trash2, Check, BarChart3 } from 'lucide-react';
import {
  crearClaseAdmin,
  borrarClaseAdmin,
  guardarGrabacionClase,
  crearEncuestaAdmin,
  cerrarEncuestaAdmin,
} from '@/app/portal/admin/actions';
import { Button } from '@/components/ui/button';
import type { GroupSession, SessionPoll } from '@/lib/types';

function fecha(iso: string | null) {
  if (!iso) return 'sin fecha';
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ClasesAdmin({
  clases,
  encuesta,
  conteos,
}: {
  clases: GroupSession[];
  encuesta: SessionPoll | null;
  conteos: Record<string, number>;
}) {
  return (
    <div className="space-y-10">
      <NuevaClase />
      <Encuesta encuesta={encuesta} conteos={conteos} />

      <section>
        <h3 className="mb-4 font-display text-base font-extrabold">Clases ({clases.length})</h3>
        {clases.length === 0 ? (
          <p className="rounded-xl border border-border bg-bg-card px-5 py-6 text-center text-[13.5px] text-text-muted">
            Todavía no has creado ninguna clase.
          </p>
        ) : (
          <div className="space-y-3">
            {clases.map((c) => (
              <FilaClase key={c.id} clase={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NuevaClase() {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    start(async () => {
      const r = await crearClaseAdmin(formData);
      if (r?.error) return setError(r.error);
      setAbierto(false);
    });
  }

  if (!abierto) {
    return (
      <Button type="button" onClick={() => setAbierto(true)}>
        <CalendarPlus className="mr-2 h-4 w-4" /> Programar clase
      </Button>
    );
  }

  return (
    <form action={enviar} className="rounded-2xl border border-border bg-bg-card p-6">
      <h3 className="font-display text-base font-extrabold">Nueva clase grupal</h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[12.5px] font-bold text-text-secondary">Título</span>
          <input
            name="title"
            required
            placeholder="Ej: Semana 3 — Revisión de creativos"
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Fecha y hora</span>
          <input
            type="datetime-local"
            name="scheduledAt"
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Duración (minutos)</span>
          <input
            type="number"
            name="durationMinutes"
            defaultValue={90}
            min={15}
            max={300}
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Link de la videollamada <span className="font-normal text-text-muted">(Meet, Zoom…)</span>
          </span>
          <input
            name="meetUrl"
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 font-mono text-[12.5px] text-white outline-none focus:border-brand-purple/60"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Grabación <span className="font-normal text-text-muted">(URL de Cloudinary, se puede añadir después)</span>
          </span>
          <input
            name="recordingUrl"
            placeholder="https://res.cloudinary.com/…/video/upload/…"
            className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 font-mono text-[12.5px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12.5px] font-bold text-text-secondary">Descripción</span>
          <textarea
            name="description"
            rows={2}
            placeholder="Qué se va a cubrir"
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creando…' : 'Crear clase'}
        </Button>
        <Button type="button" variant="subtle" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function FilaClase({ clase }: { clase: GroupSession }) {
  const [url, setUrl] = useState(clase.recording_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, start] = useTransition();

  function guardar() {
    setError(null);
    start(async () => {
      const r = await guardarGrabacionClase(clase.id, url);
      if (r?.error) return setError(r.error);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[14.5px] font-extrabold">{clase.title}</p>
          <p className="mt-0.5 font-mono text-[11.5px] text-text-muted">
            {fecha(clase.scheduled_at)} · {clase.duration_minutes} min
          </p>
        </div>
        <button
          type="button"
          onClick={() => start(async () => void (await borrarClaseAdmin(clase.id)))}
          aria-label="Borrar clase"
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="min-w-[240px] flex-1">
          <span className="text-[11.5px] font-bold text-text-secondary">Grabación (Cloudinary)</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/…/video/upload/…"
            className="mt-1.5 w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 font-mono text-[12px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
          />
        </label>
        <Button type="button" variant="subtle" onClick={guardar} disabled={pending}>
          {guardado ? <Check className="mr-1.5 h-3.5 w-3.5 text-brand-success" /> : null}
          {guardado ? 'Guardado' : 'Guardar'}
        </Button>
      </div>

      {error && <p className="mt-2 text-[12.5px] text-brand-danger">{error}</p>}
    </div>
  );
}

function Encuesta({ encuesta, conteos }: { encuesta: SessionPoll | null; conteos: Record<string, number> }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const total = Object.values(conteos).reduce((a, b) => a + b, 0);

  function enviar(formData: FormData) {
    setError(null);
    start(async () => {
      const r = await crearEncuestaAdmin(formData);
      if (r?.error) return setError(r.error);
      setAbierto(false);
    });
  }

  return (
    <section className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/[0.05] p-6">
      <h3 className="flex items-center gap-2 font-display text-base font-extrabold">
        <BarChart3 className="h-4 w-4 text-brand-yellow" /> Encuesta del día
      </h3>

      {encuesta ? (
        <div className="mt-4">
          <p className="text-[14px] font-semibold text-white">{encuesta.question}</p>
          <p className="mt-1 font-mono text-[11.5px] text-text-muted">
            {total} {total === 1 ? 'voto' : 'votos'}
          </p>
          <div className="mt-4 space-y-2">
            {encuesta.options.map((o) => {
              const votos = conteos[o.id] ?? 0;
              const pct = total > 0 ? Math.round((votos / total) * 100) : 0;
              return (
                <div key={o.id} className="relative overflow-hidden rounded-lg border border-border bg-bg-card px-4 py-2.5">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-brand-yellow/12"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-3 text-[13.5px]">
                    <span className="text-white">{o.label}</span>
                    <span className="font-mono text-[11.5px] text-text-muted">
                      {votos} · {pct}%
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="subtle"
              onClick={() => start(async () => void (await cerrarEncuestaAdmin(encuesta.id)))}
              disabled={pending}
            >
              Cerrar encuesta
            </Button>
            <Button type="button" variant="subtle" onClick={() => setAbierto(true)}>
              Crear otra
            </Button>
          </div>
        </div>
      ) : !abierto ? (
        <>
          <p className="mt-2 text-[13.5px] text-text-muted">
            No hay ninguna encuesta abierta. Crea una para coordinar el día de la clase.
          </p>
          <Button type="button" variant="subtle" className="mt-4" onClick={() => setAbierto(true)}>
            Crear encuesta
          </Button>
        </>
      ) : null}

      {abierto && (
        <form action={enviar} className="mt-5 space-y-4 border-t border-border/70 pt-5">
          <label className="block">
            <span className="text-[12.5px] font-bold text-text-secondary">Pregunta</span>
            <input
              name="question"
              defaultValue="¿Qué día te sirve para la clase grupal?"
              className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
            />
          </label>
          <label className="block">
            <span className="text-[12.5px] font-bold text-text-secondary">
              Opciones <span className="font-normal text-text-muted">(una por línea, mínimo dos)</span>
            </span>
            <textarea
              name="opciones"
              rows={4}
              defaultValue={'Martes 7:00 pm\nJueves 7:00 pm\nSábado 10:00 am'}
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none focus:border-brand-purple/60"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Creando…' : 'Publicar encuesta'}
            </Button>
            <Button type="button" variant="subtle" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
          <p className="text-[12px] text-text-muted">
            Al publicar una nueva se cierra la anterior: solo puede haber una abierta a la vez.
          </p>
        </form>
      )}
    </section>
  );
}
