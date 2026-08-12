'use client';

import { useState, useTransition } from 'react';
import {
  CalendarDays,
  Video,
  ExternalLink,
  Download,
  Check,
  Pencil,
  CircleDashed,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import { guardarTema } from '@/app/portal/ayuda/actions';
import { urlGoogleCalendar, urlDescargaICS } from '@/lib/calendario';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OneOnOneSession, EstadoSesion } from '@/lib/types';

const ESTADOS: Record<EstadoSesion, { texto: string; clase: string; Icono: typeof CircleDashed }> = {
  pendiente: { texto: 'Por agendar', clase: 'text-text-muted', Icono: CircleDashed },
  agendada: { texto: 'Agendada', clase: 'text-brand-purpleLight', Icono: CalendarDays },
  hecha: { texto: 'Hecha', clase: 'text-brand-success', Icono: CircleCheck },
  cancelada: { texto: 'Cancelada', clase: 'text-brand-danger', Icono: CircleX },
  no_asistio: { texto: 'No asististe', clase: 'text-brand-yellow', Icono: CircleX },
};

function fechaLarga(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Está "en vivo" desde 15 min antes hasta que termina. */
function enVivo(s: OneOnOneSession) {
  if (!s.scheduled_at || s.status === 'cancelada' || s.status === 'hecha') return false;
  const inicio = new Date(s.scheduled_at).getTime();
  const ahora = Date.now();
  return ahora >= inicio - 15 * 60_000 && ahora <= inicio + s.duration_minutes * 60_000;
}

export function Cronograma({ sesiones }: { sesiones: OneOnOneSession[] }) {
  if (sesiones.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-bg-card px-6 py-10 text-center text-[14px] text-text-muted">
        Juan todavía no ha armado tu cronograma. Aparecerá aquí en cuanto lo haga.
      </p>
    );
  }

  const hechas = sesiones.filter((s) => s.status === 'hecha').length;
  const proxima = sesiones.find(
    (s) => s.scheduled_at && new Date(s.scheduled_at).getTime() > Date.now() && s.status !== 'cancelada'
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-5 py-4">
        <p className="text-[13.5px] text-text-secondary">
          <span className="font-mono text-[16px] font-medium text-white">
            {hechas}/{sesiones.length}
          </span>{' '}
          sesiones completadas
        </p>
        {proxima?.scheduled_at && (
          <p className="text-[12.5px] capitalize text-text-muted">
            Próxima: {fechaLarga(proxima.scheduled_at)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {sesiones.map((s) => (
          <Sesion key={s.id} sesion={s} />
        ))}
      </div>
    </div>
  );
}

function Sesion({ sesion: s }: { sesion: OneOnOneSession }) {
  const [editando, setEditando] = useState(false);
  const [tema, setTema] = useState(s.student_topic ?? '');
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const estado = ESTADOS[s.status] ?? ESTADOS.pendiente;
  const vivo = enVivo(s);
  const titulo = s.title?.trim() || `Sesión ${s.session_number}`;

  const evento = {
    titulo: `${titulo} — Generación 1K`,
    descripcion: s.student_topic ? `Tema que propusiste: ${s.student_topic}` : null,
    inicio: s.scheduled_at,
    duracionMinutos: s.duration_minutes,
    url: s.meet_url,
  };
  const google = urlGoogleCalendar(evento);
  const ics = urlDescargaICS(evento, s.id);

  function guardar() {
    setError(null);
    start(async () => {
      const r = await guardarTema(s.id, tema);
      if (r?.error) return setError(r.error);
      setEditando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    });
  }

  return (
    <article
      className={cn(
        'rounded-2xl border p-5',
        vivo ? 'border-brand-success/45 bg-brand-success/[0.07]' : 'border-border bg-bg-card',
        s.status === 'cancelada' && 'opacity-60'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-mono text-[11px] text-text-secondary">
              {s.session_number}
            </span>
            <h3 className="font-display text-[15px] font-extrabold tracking-tight">{titulo}</h3>
            {vivo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-success/20 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> ahora
              </span>
            )}
          </div>

          <p className={cn('flex items-center gap-1.5 text-[12.5px]', estado.clase)}>
            <estado.Icono className="h-3.5 w-3.5 shrink-0" />
            {s.scheduled_at ? (
              <span className="capitalize text-text-secondary">{fechaLarga(s.scheduled_at)}</span>
            ) : (
              estado.texto
            )}
            {s.scheduled_at && <span className="text-text-muted">· {s.duration_minutes} min</span>}
          </p>
        </div>

        {s.meet_url && s.status !== 'cancelada' && s.status !== 'hecha' && (
          <a
            href={s.meet_url}
            target="_blank"
            rel="noopener"
            className={cn(
              'inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl px-4 text-[13.5px] font-bold transition-colors',
              vivo
                ? 'bg-brand-success text-black hover:bg-brand-success/85'
                : 'bg-brand-purple text-white hover:bg-brand-purpleLight'
            )}
          >
            <Video className="h-4 w-4" /> Entrar
          </a>
        )}
      </div>

      {/* Guardar en el calendario */}
      {s.scheduled_at && s.status !== 'cancelada' && s.status !== 'hecha' && (google || ics) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {google && (
            <a
              href={google}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5" /> Google Calendar
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {ics && (
            <a
              href={ics}
              download={`sesion-${s.session_number}-generacion1k.ics`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" /> Apple / Outlook
            </a>
          )}
        </div>
      )}

      {/* Tema propuesto por el estudiante */}
      {s.status !== 'cancelada' && (
        <div className="mt-4 border-t border-border/70 pt-4">
          {editando ? (
            <>
              <label className="text-[12px] font-bold text-text-secondary">
                ¿Qué quieres tratar en esta sesión?
              </label>
              <textarea
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Ej: revisar por qué mi campaña tiene CTR alto pero cero ventas."
                className="mt-2 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[13.5px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
              />
              {error && <p className="mt-2 text-[12.5px] text-brand-danger">{error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={guardar} disabled={pending}>
                  {pending ? 'Guardando…' : 'Guardar tema'}
                </Button>
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => {
                    setTema(s.student_topic ?? '');
                    setEditando(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : s.student_topic ? (
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-[13.5px] leading-relaxed text-text-secondary">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-purpleLight">
                  Tu tema:{' '}
                </span>
                {s.student_topic}
              </p>
              <button
                onClick={() => setEditando(true)}
                aria-label="Editar tema"
                className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                {guardado ? <Check className="h-3.5 w-3.5 text-brand-success" /> : <Pencil className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="text-[13px] font-semibold text-brand-purpleLight transition-colors hover:text-white"
            >
              + Proponer un tema para esta sesión
            </button>
          )}
        </div>
      )}

      {s.recording_url && (
        <div className="mt-4">
          <VideoPlayer url={s.recording_url} titulo={`Grabación — ${titulo}`} />
        </div>
      )}
    </article>
  );
}
